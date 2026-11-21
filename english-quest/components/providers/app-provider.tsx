"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  changePasswordRequest,
  deleteAccountRequest,
  googleAuthRequest,
  loginRequest,
  logoutAllRequest,
  logoutRequest,
  registerRequest,
  restoreSession,
  setPasswordRequest,
  updateProfileRequest,
} from "@/lib/auth/client";
import type { AuthUser, UserRole } from "@/lib/auth/types";
import {
  clearLocalGuest,
  getLocalGuest,
} from "@/lib/guest/client";
import { mergeGuestIntoStudent } from "@/lib/guest/merge";
import { createLog } from "@/lib/activity-log";
import {
  createStudentLearningState,
  createStudentPermissions,
} from "@/lib/data/create-student-state";
import {
  messageFromRequest,
  processStudentRequest,
  runActivityAnalysis,
} from "@/lib/ai/orchestrator";
import { qestraAI } from "@/lib/ai/qestra-ai";
import {
  defaultPermissions,
  initialLessonDraft,
  initialLive,
  initialLogs,
  initialMessages,
  initialNotifications,
  initialSettings,
  initialTranslations,
  learningStates as seedStates,
  soloPermissions,
  type AppSettings,
} from "@/lib/data/mock-students";
import { getStudentGameCatalog } from "@/lib/data/catalog-games";
import {
  createCreditAccount,
  canSpend,
  spend,
  STUDENT_DAILY_CREDITS,
  type CreditAccount,
} from "@/lib/credits";
import { recordLearningEvidence } from "@/lib/learning-evidence";
import {
  mockTranscribeGerman,
  mockTranslateToEnglish,
  mockTranslateWord,
} from "@/lib/messaging";
import {
  createDailyMeeting,
  endDailyMeetingRemote,
  fetchDailyMeeting,
} from "@/lib/ai/server-client";
import { canPerform, cyclePermission } from "@/lib/permissions";
import {
  DEFAULT_SUBJECT_ID,
  getSubject,
  type SubjectId,
} from "@/lib/subjects";
import type { GameTemplateId } from "@/lib/game-templates";
import { getGameTemplate } from "@/lib/game-templates";
import { applyActivityCompletion } from "@/lib/student/progress-engine";
import {
  fetchRemoteBundle,
  loadLocalBundle,
  saveRemoteBundle,
} from "@/lib/student/persist";
import { loadSession } from "@/lib/auth/session";
import type {
  ActivityLogEntry,
  ActivityStatus,
  AIComparison,
  Game,
  LearningState,
  LessonDraft,
  LessonPermissions,
  LiveLessonState,
  StudentMessage,
  TeacherNotification,
  TranslationRequest,
} from "@/lib/types";

type AppContextValue = {
  authReady: boolean;
  authUser: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }) => Promise<AuthUser>;
  loginWithGoogle: (idToken: string, role: UserRole) => Promise<AuthUser>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  updateProfile: (input: {
    name: string;
    email: string;
  }) => Promise<AuthUser>;
  changePassword: (input: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<AuthUser>;
  setPassword: (newPassword: string) => Promise<AuthUser>;
  deleteAccount: (input: {
    email: string;
    confirm: string;
    password?: string;
  }) => Promise<void>;
  activeStudentId: string;
  setActiveStudentId: (id: string) => void;
  activeSubjectId: SubjectId;
  setActiveSubjectId: (id: SubjectId) => void;
  studentCredits: CreditAccount;
  creditCostPerRequest: number;
  learningStates: Record<string, LearningState>;
  games: Game[];
  permissions: Record<string, LessonPermissions>;
  translations: TranslationRequest[];
  messages: StudentMessage[];
  notifications: TeacherNotification[];
  logs: ActivityLogEntry[];
  settings: AppSettings;
  live: LiveLessonState;
  lessonDraft: LessonDraft | null;
  lastComparison: AIComparison | null;
  activeStudent: LearningState;
  isLive: boolean;
  isChildMode: boolean;
  meetingBusy: boolean;
  meetingError: string | null;
  updateSettings: (patch: Partial<AppSettings>) => void;
  toggleInterest: (interest: string) => void;
  setLiveActive: (active: boolean) => void;
  setLiveStudent: (studentId: string) => void;
  startDailyMeeting: (studentId?: string) => Promise<void>;
  endDailyMeeting: () => void;
  cyclePerm: (studentId: string, key: keyof LessonPermissions) => void;
  requestTranslation: (word: string) => Promise<void>;
  decideTranslation: (id: string, approve: boolean) => void;
  submitStudentRequest: (text: string, kind?: "text" | "voice") => Promise<StudentMessage>;
  recordVoiceRequest: () => Promise<StudentMessage>;
  decideStudentRequest: (id: string, approve: boolean) => void;
  setActivityStatus: (gameId: string, status: ActivityStatus) => void;
  completeActivity: (gameId: string, score: number, hintsUsed: number) => Promise<void>;
  generateLesson: (input: {
    studentId: string;
    goal: string;
    duration: number;
    instruction?: string;
  }) => Promise<void>;
  fillGameTemplate: (templateId: GameTemplateId, topic: string) => Promise<string>;
  updateLessonActivity: (
    activityId: string,
    patch: Partial<LessonDraft["activities"][number]>
  ) => void;
  reorderLessonActivity: (activityId: string, direction: "up" | "down") => void;
  decideRecommendation: (action: "approve" | "reject" | "release") => void;
  useCopilotSuggestion: () => void;
  lockStudentScreen: (locked: boolean) => void;
  pauseCurrentActivity: () => void;
  markNotificationRead: (id: string) => void;
  can: (
    key: keyof LessonPermissions,
    opts?: { hasApproval?: boolean; requested?: boolean }
  ) => boolean;
  onboardingDone: boolean;
  badgeIds: string[];
  completeOnboarding: (input: {
    interests: string[];
    cefrLevel: string;
    age: number;
  }) => void;
  helpRequest: { id: string; status: "open" | "accepted"; at: string } | null;
  requestLiveHelp: () => void;
  persistReady: boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

const CREDIT_COST = 5;

export function AppProvider({ children }: { children: ReactNode }) {
  const [authReady, setAuthReady] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [activeStudentId, setActiveStudentIdState] = useState("alex");
  const [activeSubjectId, setActiveSubjectIdState] =
    useState<SubjectId>(DEFAULT_SUBJECT_ID);
  const [studentCredits, setStudentCredits] = useState<CreditAccount>(() =>
    createCreditAccount("student")
  );
  const [learningStates, setLearningStates] = useState(seedStates);
  const [games, setGames] = useState(() => getStudentGameCatalog());
  const [onboardingDone, setOnboardingDone] = useState(true);
  const [badgeIds, setBadgeIds] = useState<string[]>([]);
  const [mergedGuestTokens, setMergedGuestTokens] = useState<string[]>([]);
  const [helpRequest, setHelpRequest] = useState<{
    id: string;
    status: "open" | "accepted";
    at: string;
  } | null>(null);
  const [persistReady, setPersistReady] = useState(false);
  const [permissions, setPermissions] = useState<Record<string, LessonPermissions>>({
    alex: defaultPermissions(),
    emma: soloPermissions(),
    noah: {
      ...soloPermissions(),
      audioRecording: "allowed",
      translator: "teacher-approval",
    },
  });
  const [translations, setTranslations] = useState(initialTranslations);
  const [messages, setMessages] = useState(initialMessages);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [logs, setLogs] = useState(initialLogs);
  const [settings, setSettings] = useState(initialSettings);
  const [live, setLive] = useState(initialLive);
  const [meetingBusy, setMeetingBusy] = useState(false);
  const [meetingError, setMeetingError] = useState<string | null>(null);
  const [lessonDraft, setLessonDraft] = useState<LessonDraft | null>(
    initialLessonDraft
  );
  const [lastComparison, setLastComparison] = useState<AIComparison | null>({
    studentRecommendation:
      "Alex is giving longer answers in football contexts and is ready for a short speaking challenge.",
    teacherRecommendation:
      "Past Simple irregular verbs remain the main teaching focus.",
    agreementScore: 88,
    disagreements: [],
    mainDecision:
      "Recommend a short A2+ football interview with Past Simple irregular verbs.",
    reasoning: [
      "Football interest",
      "Grammar accuracy ~61%",
      "Higher completion on short tasks",
    ],
    confidence: 0.88,
    requiresTeacherApproval: true,
  });

  const activeStudent =
    learningStates[activeStudentId] ??
    createStudentLearningState(
      activeStudentId,
      authUser?.name ?? "Schüler"
    );
  const isLive = settings.liveLessonActive && live.active;
  const isChildMode = activeStudent.ageGroup === "child";

  const persistStudent = useCallback(
    async (sid: string, state: LearningState, credits: CreditAccount) => {
      const completedActivityIds = state.activityHistory
        .filter((a) => a.status === "completed")
        .map((a) => a.activityId);
      const token = loadSession()?.token;
      await saveRemoteBundle(
        {
          studentId: sid,
          learningState: state,
          credits,
          completedActivityIds,
          gameProgress: {},
          onboardingDone,
          helpRequest,
          badgeIds,
          mergedGuestTokens,
        },
        token
      );
    },
    [onboardingDone, helpRequest, badgeIds, mergedGuestTokens]
  );

  const ensureStudentProfile = useCallback((user: AuthUser) => {
    if (user.role !== "student" || !user.studentId) return;
    const sid = user.studentId;
    setActiveStudentIdState(sid);
    setPermissions((prev) =>
      prev[sid] ? prev : { ...prev, [sid]: createStudentPermissions() }
    );
    void (async () => {
      const token = loadSession()?.token;
      const remote = await fetchRemoteBundle(sid, token);
      const local = loadLocalBundle(sid);
      const bundle = remote ?? local;
      let state: LearningState;
      let badges = bundle?.badgeIds ?? [];
      let mergedTokens = bundle?.mergedGuestTokens ?? [];
      let creditsAcc = bundle?.credits;
      let onboarded = Boolean(bundle?.onboardingDone);

      if (bundle?.learningState) {
        state = {
          ...bundle.learningState,
          name: user.name || bundle.learningState.name,
        };
        setHelpRequest(bundle.helpRequest ?? null);
        setGames((prev) =>
          prev.map((g) =>
            bundle.completedActivityIds?.includes(g.id)
              ? { ...g, status: "completed" as const }
              : g
          )
        );
      } else {
        state = createStudentLearningState(sid, user.name);
        onboarded = false;
        creditsAcc = createCreditAccount("student");
      }

      const guest = getLocalGuest();
      if (guest?.payload) {
        const merge = mergeGuestIntoStudent(
          {
            xp: state.xp,
            interests: state.interests,
            badgeIds: badges,
            mergedGuestTokens: mergedTokens,
          },
          guest.payload,
          { tokenId: guest.token }
        );
        if (merge.applied) {
          state = {
            ...state,
            xp: merge.student.xp,
            interests: merge.student.interests,
          };
          badges = merge.student.badgeIds;
          mergedTokens = merge.student.mergedGuestTokens ?? mergedTokens;
          clearLocalGuest();
          // Server-Session als gemerged markieren (best effort)
          try {
            const base =
              process.env.NEXT_PUBLIC_AI_API_BASE?.replace(/\/$/, "") ||
              `${window.location.origin}/api`;
            await fetch(`${base}/guest.php`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                action: "merge",
                token: guest.token,
                userId: user.id,
              }),
            });
          } catch {
            /* offline ok */
          }
        }
      }

      setLearningStates((prev) => ({ ...prev, [sid]: state }));
      if (creditsAcc) setStudentCredits(creditsAcc);
      setOnboardingDone(onboarded);
      setBadgeIds(badges);
      setMergedGuestTokens(mergedTokens);
      await saveRemoteBundle(
        {
          studentId: sid,
          learningState: state,
          credits: creditsAcc ?? createCreditAccount("student"),
          completedActivityIds: state.activityHistory
            .filter((a) => a.status === "completed")
            .map((a) => a.activityId),
          gameProgress: {},
          onboardingDone: onboarded,
          helpRequest: bundle?.helpRequest ?? null,
          badgeIds: badges,
          mergedGuestTokens: mergedTokens,
        },
        token
      );
      setPersistReady(true);
    })();
  }, []);

  const setActiveStudentId = useCallback(
    (id: string) => {
      // Schüler dürfen nicht in andere Profile springen
      if (authUser?.role === "student") return;
      setActiveStudentIdState(id);
    },
    [authUser?.role]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await restoreSession();
      if (cancelled) return;
      if (session?.user) {
        setAuthUser(session.user);
        ensureStudentProfile(session.user);
      }
      setAuthReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [ensureStudentProfile]);

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await loginRequest(email, password);
      setAuthUser(session.user);
      ensureStudentProfile(session.user);
      return session.user;
    },
    [ensureStudentProfile]
  );

  const register = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      role: UserRole;
    }) => {
      const session = await registerRequest(input);
      setAuthUser(session.user);
      ensureStudentProfile(session.user);
      return session.user;
    },
    [ensureStudentProfile]
  );

  const loginWithGoogle = useCallback(
    async (idToken: string, role: UserRole) => {
      const session = await googleAuthRequest({ idToken, role });
      setAuthUser(session.user);
      ensureStudentProfile(session.user);
      return session.user;
    },
    [ensureStudentProfile]
  );

  const logout = useCallback(async () => {
    await logoutRequest();
    setAuthUser(null);
  }, []);

  const logoutAll = useCallback(async () => {
    await logoutAllRequest();
    setAuthUser(null);
  }, []);

  const updateProfile = useCallback(async (input: {
    name: string;
    email: string;
  }) => {
    const user = await updateProfileRequest(input);
    setAuthUser(user);
    if (user.role === "student" && user.studentId) {
      setLearningStates((prev) => {
        const sid = user.studentId!;
        if (!prev[sid]) return prev;
        return { ...prev, [sid]: { ...prev[sid], name: user.name } };
      });
    }
    return user;
  }, []);

  const changePassword = useCallback(
    async (input: { currentPassword: string; newPassword: string }) => {
      const user = await changePasswordRequest(input);
      setAuthUser(user);
      return user;
    },
    []
  );

  const setPassword = useCallback(async (newPassword: string) => {
    const user = await setPasswordRequest(newPassword);
    setAuthUser(user);
    return user;
  }, []);

  const deleteAccount = useCallback(
    async (input: { email: string; confirm: string; password?: string }) => {
      await deleteAccountRequest(input);
      setAuthUser(null);
    },
    []
  );

  const pushLog = useCallback(
    (entry: Omit<ActivityLogEntry, "id" | "timestamp"> & { timestamp?: string }) => {
      setLogs((prev) => [createLog(entry), ...prev]);
    },
    []
  );

  const setActiveSubjectId = (id: SubjectId) => {
    const sub = getSubject(id);
    if (sub.status === "planned") {
      pushLog({
        category: "Warnings",
        message: `${sub.labelDe} ist noch nicht verfügbar.`,
      });
      return;
    }
    setActiveSubjectIdState(id);
    setLearningStates((prev) => {
      const next = { ...prev };
      for (const sid of Object.keys(next)) {
        next[sid] = {
          ...next[sid],
          subjectId: id,
          lastUpdated: new Date().toISOString(),
        };
      }
      return next;
    });
    pushLog({
      category: "Learning State",
      message: `Fach gewechselt → ${sub.labelDe}`,
    });
  };

  const updateSettings = (patch: Partial<AppSettings>) => {
    setSettings((s) => {
      const next = { ...s, ...patch };
      if (patch.liveLessonActive !== undefined) {
        setLive((l) => ({ ...l, active: patch.liveLessonActive! }));
        pushLog({
          category: "Permissions",
          message: patch.liveLessonActive
            ? "Live lesson mode enabled"
            : "Solo mode enabled",
        });
      }
      return next;
    });
  };

  const toggleInterest = (interest: string) => {
    setLearningStates((prev) => {
      const s = prev[activeStudentId];
      if (!s) return prev;
      const has = s.interests.includes(interest);
      const interests = has
        ? s.interests.filter((i) => i !== interest)
        : [...s.interests, interest];
      const nextState = {
        ...s,
        interests,
        lastUpdated: new Date().toISOString(),
      };
      pushLog({
        studentId: activeStudentId,
        category: "Learning State",
        message: has
          ? `${s.name}: Interesse entfernt (${interest})`
          : `${s.name}: Interesse gewählt (${interest})`,
      });
      if (isLive) {
        setNotifications((n) => [
          {
            id: `note-${Date.now()}`,
            studentId: activeStudentId,
            studentName: s.name,
            message: `${s.name} hat Interessen geändert (${interest}). Aktuelle Aktivität bleibt unverändert.`,
            createdAt: new Date().toISOString(),
            read: false,
            type: "ai",
          },
          ...n,
        ]);
      }
      void persistStudent(activeStudentId, nextState, studentCredits);
      return { ...prev, [activeStudentId]: nextState };
    });
  };

  const setLiveActive = (active: boolean) => {
    setLive((l) => ({ ...l, active }));
    setSettings((s) => ({ ...s, liveLessonActive: active }));
  };

  const setLiveStudent = (studentId: string) => {
    setActiveStudentId(studentId);
    setLive((l) => ({ ...l, studentId }));
  };

  const startDailyMeeting = async (studentId?: string) => {
    const sid = studentId ?? live.studentId ?? activeStudentId;
    setMeetingBusy(true);
    setMeetingError(null);
    try {
      const room = await createDailyMeeting(sid);
      setLive((l) => ({
        ...l,
        active: true,
        studentId: sid,
        dailyRoomUrl: room.url,
        dailyRoomName: room.name,
      }));
      setSettings((s) => ({ ...s, liveLessonActive: true }));
      pushLog({
        studentId: sid,
        category: "Navigation",
        message: `Daily.co Meeting gestartet: ${room.name}`,
      });
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : "Meeting konnte nicht gestartet werden.";
      setMeetingError(msg);
      pushLog({
        studentId: sid,
        category: "Warnings",
        message: `Daily.co Fehler: ${msg}`,
      });
    } finally {
      setMeetingBusy(false);
    }
  };

  const endDailyMeeting = () => {
    void endDailyMeetingRemote();
    setLive((l) => ({
      ...l,
      dailyRoomUrl: null,
      dailyRoomName: null,
    }));
    setMeetingError(null);
    pushLog({
      category: "Navigation",
      message: "Daily.co Meeting beendet",
    });
  };

  // Students (and reloads) pick up the active Daily room from the PHP API.
  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      const room = await fetchDailyMeeting(activeStudentId);
      if (cancelled) return;
      if (room?.url) {
        setLive((l) => ({
          ...l,
          active: true,
          studentId: room.studentId || l.studentId,
          dailyRoomUrl: room.url,
          dailyRoomName: room.name,
        }));
        setSettings((s) => ({ ...s, liveLessonActive: true }));
      }
    };
    void sync();
    const id = window.setInterval(sync, 8000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [activeStudentId]);

  const cyclePerm = (studentId: string, key: keyof LessonPermissions) => {
    setPermissions((prev) => {
      const nextMode = cyclePermission(prev[studentId][key]);
      pushLog({
        studentId,
        category: "Permissions",
        message: `Permission ${key} → ${nextMode}`,
      });
      return {
        ...prev,
        [studentId]: { ...prev[studentId], [key]: nextMode },
      };
    });
  };

  const requestTranslation = async (word: string) => {
    const perms = permissions[activeStudentId];
    if (perms.translator === "disabled") {
      pushLog({
        studentId: activeStudentId,
        category: "Warnings",
        message: "Translation request blocked (disabled)",
      });
      return;
    }
    const needsApproval =
      perms.translator === "teacher-approval" ||
      perms.translator === "available-after-request" ||
      isLive;
    const translated = mockTranslateWord(word);
    const req: TranslationRequest = {
      id: `tr-${Date.now()}`,
      studentId: activeStudentId,
      studentName: activeStudent.name,
      sourceText: word,
      sourceLanguage: "en",
      targetLanguage: "de",
      translatedText: translated,
      status: needsApproval ? "pending" : "approved",
      createdAt: new Date().toISOString(),
      shown: !needsApproval,
    };
    setTranslations((t) => [req, ...t]);
    pushLog({
      studentId: activeStudentId,
      category: "Translator",
      message: `${activeStudent.name} requested translation: “${word}”`,
    });
  };

  const decideTranslation = (id: string, approve: boolean) => {
    setTranslations((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: approve ? "approved" : "denied",
              shown: approve,
            }
          : t
      )
    );
    pushLog({
      category: "Translator",
      message: approve
        ? "Teacher approved translation"
        : "Teacher denied translation (hidden from student)",
    });
  };

  const submitStudentRequest = async (
    text: string,
    kind: "text" | "voice" = "text"
  ) => {
    if (!canSpend(studentCredits, CREDIT_COST)) {
      const blocked = messageFromRequest(
        {
          interpretation: "Credit-Limit erreicht",
          teacherReview: "",
          comparison: {
            studentRecommendation: "",
            teacherRecommendation: "",
            agreementScore: 0,
            disagreements: [],
            mainDecision: "Keine Credits",
            reasoning: [],
            confidence: 0,
            requiresTeacherApproval: true,
          },
          proposal: {
            id: "credit-block",
            title: "Morgen weiter",
            description: "Tägliches Credit-Kontingent aufgebraucht — kein Verlust von Fortschritt.",
            level: activeStudent.cefrLevel,
            durationMinutes: 0,
            skill: "rest",
            focus: [],
            support: [],
            personalization: [],
            status: "locked",
            aiReasoning: ["Credits"],
            topic: "pause",
          },
          autoReply:
            `Heute sind deine ${STUDENT_DAILY_CREDITS} KI-Credits aufgebraucht. ` +
            "Dein Fortschritt bleibt — morgen geht’s weiter. Pause ist ok!",
        },
        {
          id: `msg-${Date.now()}`,
          studentId: activeStudentId,
          studentName: activeStudent.name,
          kind,
          text: kind === "text" ? text : undefined,
          createdAt: new Date().toISOString(),
          status: "ai-replied",
        }
      );
      setMessages((m) => [blocked, ...m]);
      return blocked;
    }

    setStudentCredits((c) => {
      const next = spend(c, CREDIT_COST);
      void persistStudent(activeStudentId, activeStudent, next);
      return next;
    });

    const result = await processStudentRequest({
      text,
      state: activeStudent,
      liveLesson: isLive,
      replyPolicy: settings.teacherReplyPolicy,
    });
    const msg = messageFromRequest(result, {
      id: `msg-${Date.now()}`,
      studentId: activeStudentId,
      studentName: activeStudent.name,
      kind,
      text: kind === "text" ? text : undefined,
      transcriptDe: kind === "voice" ? text : undefined,
      translationEn:
        kind === "voice" ? mockTranslateToEnglish(text) : undefined,
      createdAt: new Date().toISOString(),
      status: "pending",
    });
    setMessages((m) => [msg, ...m]);
    setLastComparison(result.comparison);
    if (result.proposal) {
      setLearningStates((prev) => ({
        ...prev,
        [activeStudentId]: {
          ...prev[activeStudentId],
          currentRecommendation: result.proposal,
        },
      }));
    }
    pushLog({
      studentId: activeStudentId,
      category: "Qestra KI",
      message: `${activeStudent.name} Anfrage (−${CREDIT_COST} Credits): “${text}”`,
    });
    if (msg.status === "pending") {
      setNotifications((n) => [
        {
          id: `note-${Date.now()}`,
          studentId: activeStudentId,
          studentName: activeStudent.name,
          message: `Neue Anfrage von ${activeStudent.name}`,
          createdAt: new Date().toISOString(),
          read: false,
          type: "request",
        },
        ...n,
      ]);
    }
    return msg;
  };

  const recordVoiceRequest = async () => {
    const de = mockTranscribeGerman();
    return submitStudentRequest(de, "voice");
  };

  const decideStudentRequest = (id: string, approve: boolean) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        if (approve && m.mainProposal) {
          setGames((g) => [
            {
              id: `gen-${Date.now()}`,
              title: m.mainProposal!.title,
              description: m.mainProposal!.description,
              level: m.mainProposal!.level,
              topic: m.mainProposal!.topic,
              durationMinutes: m.mainProposal!.durationMinutes,
              type: "speaking",
              xpReward: 70,
              status: "released",
              studentId: m.studentId,
              aiReasoning: m.mainProposal!.aiReasoning,
              steps: [
                {
                  id: "gs1",
                  prompt: "Ready? Let's practise!",
                  type: "mcq",
                  options: ["Yes!", "One moment", "Start"],
                  correctId: "0",
                },
              ],
            },
            ...g,
          ]);
          setLearningStates((ls) => ({
            ...ls,
            [m.studentId]: {
              ...ls[m.studentId],
              currentRecommendation: {
                ...m.mainProposal!,
                status: "released",
              },
            },
          }));
        }
        return {
          ...m,
          status: approve ? "approved" : "denied",
        };
      })
    );
    pushLog({
      category: "Activities",
      message: approve
        ? "Student request approved and released"
        : "Student request denied",
    });
  };

  const setActivityStatus = (gameId: string, status: ActivityStatus) => {
    setGames((prev) =>
      prev.map((g) => (g.id === gameId ? { ...g, status } : g))
    );
    if (status === "active") {
      setLive((l) => ({ ...l, currentActivityId: gameId }));
    }
    pushLog({
      category: "Activities",
      message: `Activity ${gameId} → ${status}`,
    });
  };

  const completeActivity = async (
    gameId: string,
    score: number,
    hintsUsed: number
  ) => {
    const game = games.find((g) => g.id === gameId);
    if (!game) return;

    const nextState = applyActivityCompletion(
      activeStudent,
      game,
      score,
      hintsUsed
    );

    const analysis = {
      activityId: gameId,
      studentId: activeStudentId,
      completed: true,
      score,
      timeSpentSeconds: game.durationMinutes * 60,
      hintsUsed,
      retries: 1,
      strengthsObserved: nextState.strengths.slice(0, 1),
      weaknessesObserved: nextState.weaknesses.slice(0, 1),
      grammarMistakes:
        score < 80 ? ["Irregular Past Simple"] : ([] as string[]),
      vocabularyMistakes: [] as string[],
      speakingSignals: {
        confidence: score > 70 ? 0.75 : 0.5,
        answerLength: 12,
      },
      engagementSignals: {
        requestedActivity: false,
        completedVoluntarily: !isLive,
        topicEngagement: 0.9,
      },
    };
    recordLearningEvidence(analysis);

    const result = await runActivityAnalysis({
      analysis,
      state: nextState,
      liveLesson: isLive,
    });
    setLastComparison(result.comparison);

    const withRec: LearningState = {
      ...nextState,
      currentRecommendation: result.proposal
        ? { ...result.proposal, status: isLive ? "pending" : "released" }
        : nextState.currentRecommendation,
    };

    setLearningStates((prev) => ({
      ...prev,
      [activeStudentId]: withRec,
    }));
    setGames((prev) =>
      prev.map((g) => (g.id === gameId ? { ...g, status: "completed" } : g))
    );
    void persistStudent(activeStudentId, withRec, studentCredits);

    const xpGain =
      withRec.xp - activeStudent.xp > 0 ? withRec.xp - activeStudent.xp : 0;
    pushLog({
      studentId: activeStudentId,
      category: "Activities",
      message:
        xpGain > 0
          ? `${game.title} abgeschlossen (+${xpGain} XP, Score ${score}%)`
          : `${game.title} bereits abgeschlossen — keine doppelte XP`,
    });
    if (!isLive && settings.notifyOnSoloComplete && xpGain > 0) {
      setNotifications((n) => [
        {
          id: `note-${Date.now()}`,
          studentId: activeStudentId,
          studentName: activeStudent.name,
          message: `${activeStudent.name} hat “${game.title}” abgeschlossen (+${xpGain} XP).`,
          createdAt: new Date().toISOString(),
          read: false,
          type: "completion",
        },
        ...n,
      ]);
    }
  };

  const completeOnboarding = (input: {
    interests: string[];
    cefrLevel: string;
    age: number;
  }) => {
    setLearningStates((prev) => {
      const s = prev[activeStudentId] ?? createStudentLearningState(
        activeStudentId,
        authUser?.name ?? "Schüler"
      );
      const ageGroup =
        input.age < 13 ? "child" : input.age < 18 ? "teenager" : "adult";
      const next: LearningState = {
        ...s,
        interests: input.interests,
        cefrLevel: input.cefrLevel,
        age: input.age,
        ageGroup,
        recommendedDifficulty: input.cefrLevel,
        currentFocus: input.interests.slice(0, 1).length
          ? [`${input.interests[0]} vocabulary`]
          : ["Getting started"],
        currentRecommendation: {
          id: `rec-onboard-${Date.now()}`,
          title: "Vocabulary Match",
          description: "Starte mit einem kurzen Vokabel-Spiel auf A2.",
          level: input.cefrLevel,
          durationMinutes: 8,
          skill: "Vocabulary",
          focus: ["Vocabulary"],
          support: ["Hints"],
          personalization: input.interests.slice(0, 2),
          status: "released",
          aiReasoning: ["Onboarding abgeschlossen", "Erste Empfehlung"],
          topic: input.interests[0] ?? "Vocabulary",
        },
        lastUpdated: new Date().toISOString(),
      };
      void persistStudent(activeStudentId, next, studentCredits);
      return { ...prev, [activeStudentId]: next };
    });
    setOnboardingDone(true);
  };

  const requestLiveHelp = () => {
    if (helpRequest?.status === "open") return;
    const req = {
      id: `help-${Date.now()}`,
      status: "open" as const,
      at: new Date().toISOString(),
    };
    setHelpRequest(req);
    setNotifications((n) => [
      {
        id: `note-help-${Date.now()}`,
        studentId: activeStudentId,
        studentName: activeStudent.name,
        message: `${activeStudent.name} bittet um Hilfe in der Live-Stunde.`,
        createdAt: new Date().toISOString(),
        read: false,
        type: "request",
      },
      ...n,
    ]);
    pushLog({
      studentId: activeStudentId,
      category: "Activities",
      message: "Hilfeanfrage an Lehrer gesendet",
    });
    void persistStudent(activeStudentId, activeStudent, studentCredits);
  };

  const generateLesson = async (input: {
    studentId: string;
    goal: string;
    duration: number;
    instruction?: string;
  }) => {
    const state = learningStates[input.studentId];
    const draft = await qestraAI.generateLesson({
      state,
      goal: input.goal,
      duration: input.duration,
      instruction: input.instruction,
    });
    setLessonDraft(draft);
    pushLog({
      studentId: input.studentId,
      category: "Qestra KI",
      message: `Lesson draft created: ${draft.title}`,
    });
  };

  const fillGameTemplate = async (templateId: GameTemplateId, topic: string) => {
    const tpl = getGameTemplate(templateId);
    const text = await qestraAI.fillGameTemplate({
      templateId: tpl.id,
      templateLabel: tpl.labelDe,
      state: activeStudent,
      topic,
    });
    pushLog({
      studentId: activeStudentId,
      category: "Qestra KI",
      message: `Game-Template „${tpl.labelDe}“ gefüllt (${topic})`,
    });
    return text;
  };

  const updateLessonActivity = (
    activityId: string,
    patch: Partial<LessonDraft["activities"][number]>
  ) => {
    setLessonDraft((d) =>
      d
        ? {
            ...d,
            activities: d.activities.map((a) =>
              a.id === activityId ? { ...a, ...patch } : a
            ),
          }
        : d
    );
  };

  const reorderLessonActivity = (
    activityId: string,
    direction: "up" | "down"
  ) => {
    setLessonDraft((d) => {
      if (!d) return d;
      const sorted = [...d.activities].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((a) => a.id === activityId);
      const swapWith = direction === "up" ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= sorted.length) return d;
      const a = sorted[idx];
      const b = sorted[swapWith];
      const orderA = a.order;
      sorted[idx] = { ...a, order: b.order };
      sorted[swapWith] = { ...b, order: orderA };
      return { ...d, activities: sorted };
    });
  };

  const decideRecommendation = (action: "approve" | "reject" | "release") => {
    setLearningStates((prev) => {
      const rec = prev[activeStudentId].currentRecommendation;
      if (!rec) return prev;
      const status: ActivityStatus =
        action === "reject"
          ? "revoked"
          : action === "release"
            ? "released"
            : "approved";
      if (action === "release" || action === "approve") {
        setGames((g) => {
          const exists = g.find((x) => x.title === rec.title);
          if (exists) {
            return g.map((x) =>
              x.title === rec.title
                ? { ...x, status: action === "release" ? "released" : "approved" }
                : x
            );
          }
          return [
            {
              id: `rec-game-${Date.now()}`,
              title: rec.title,
              description: rec.description,
              level: rec.level,
              topic: rec.topic,
              durationMinutes: rec.durationMinutes,
              type: "speaking" as const,
              xpReward: 80,
              status: action === "release" ? "released" : "approved",
              studentId: activeStudentId,
              aiReasoning: rec.aiReasoning,
              steps: [
                {
                  id: "r1",
                  prompt: "What did the player do after the match?",
                  type: "speaking" as const,
                  audioHint: "Use Past Simple.",
                },
              ],
            },
            ...g,
          ];
        });
      }
      pushLog({
        studentId: activeStudentId,
      category: "Qestra KI",
      message: `Teacher ${action}d recommendation “${rec.title}”`,
      });
      return {
        ...prev,
        [activeStudentId]: {
          ...prev[activeStudentId],
          currentRecommendation: { ...rec, status },
        },
      };
    });
  };

  const useCopilotSuggestion = () => {
    decideRecommendation("release");
    pushLog({
      studentId: live.studentId,
      category: "Qestra KI",
      message: "Teacher used AI Copilot suggestion",
    });
  };

  const lockStudentScreen = (locked: boolean) => {
    setLive((l) => ({ ...l, studentScreenLocked: locked }));
    pushLog({
      category: "Permissions",
      message: locked ? "Student screen locked" : "Student screen unlocked",
    });
  };

  const pauseCurrentActivity = () => {
    if (live.currentActivityId) {
      setActivityStatus(live.currentActivityId, "paused");
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((n) =>
      n.map((x) => (x.id === id ? { ...x, read: true } : x))
    );
  };

  const can = (
    key: keyof LessonPermissions,
    opts?: { hasApproval?: boolean; requested?: boolean }
  ) =>
    canPerform(
      permissions[activeStudentId] ?? createStudentPermissions(),
      key,
      opts
    );

  const value = useMemo<AppContextValue>(
    () => ({
      authReady,
      authUser,
      login,
      register,
      loginWithGoogle,
      logout,
      logoutAll,
      updateProfile,
      changePassword,
      setPassword,
      deleteAccount,
      activeStudentId,
      setActiveStudentId,
      activeSubjectId,
      setActiveSubjectId,
      studentCredits,
      creditCostPerRequest: CREDIT_COST,
      learningStates,
      games,
      permissions,
      translations,
      messages,
      notifications,
      logs,
      settings,
      live,
      lessonDraft,
      lastComparison,
      activeStudent,
      isLive,
      isChildMode,
      meetingBusy,
      meetingError,
      updateSettings,
      toggleInterest,
      setLiveActive,
      setLiveStudent,
      startDailyMeeting,
      endDailyMeeting,
      cyclePerm,
      requestTranslation,
      decideTranslation,
      submitStudentRequest,
      recordVoiceRequest,
      decideStudentRequest,
      setActivityStatus,
      completeActivity,
      generateLesson,
      fillGameTemplate,
      updateLessonActivity,
      reorderLessonActivity,
      decideRecommendation,
      useCopilotSuggestion,
      lockStudentScreen,
      pauseCurrentActivity,
      markNotificationRead,
      can,
      onboardingDone,
      badgeIds,
      completeOnboarding,
      helpRequest,
      requestLiveHelp,
      persistReady,
    }),
    // Actions close over latest state; listing them would churn the context every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      authReady,
      authUser,
      login,
      register,
      loginWithGoogle,
      logout,
      logoutAll,
      updateProfile,
      changePassword,
      setPassword,
      deleteAccount,
      activeStudentId,
      setActiveStudentId,
      activeSubjectId,
      studentCredits,
      onboardingDone,
      badgeIds,
      helpRequest,
      persistReady,
      learningStates,
      games,
      permissions,
      translations,
      messages,
      notifications,
      logs,
      settings,
      live,
      lessonDraft,
      lastComparison,
      activeStudent,
      isLive,
      isChildMode,
      meetingBusy,
      meetingError,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
