const fs = require('fs');

// 1. Update HijamaBookingModal.tsx
let code = fs.readFileSync('app/components/hijama/HijamaBookingModal.tsx', 'utf8');

code = code.replace(
  'import { useSession, signIn, signUp } from "@/lib/auth-client";\nimport { CLINIC_INFO } from "@/app/data/products";\nimport { isStaffRole } from "@/lib/rbac-base";\nimport AuthModal from "@/app/components/AuthModal";',
  'import { useSession } from "@/lib/auth-client";\nimport { CLINIC_INFO } from "@/app/data/products";\nimport { isStaffRole } from "@/lib/rbac-base";\nimport { useRouter } from "next/navigation";\nimport {\n  HIJAMA_BOOKING_DRAFT_KEY,\n  saveBookingDraft,\n  getBookingDraft,\n  clearBookingDraft,\n  buildAuthUrl,\n} from "@/lib/auth-redirect";'
);

const oldStateRegex = /  \/\/ Authentication Gate state \(Step 4 for unauthenticated users\)[\s\S]*?const \[isAuthModalOpen, setIsAuthModalOpen\] = useState\(false\);/;
const newState = `  const router = useRouter();

  // Restore saved booking draft if returning from auth redirect
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const shouldResume = params.get("resumeBooking");
    if (shouldResume === "hijama" || shouldResume === "true") {
      const draft = getBookingDraft(HIJAMA_BOOKING_DRAFT_KEY);
      if (draft) {
        if (draft.gender) setGender(draft.gender);
        if (draft.selectedDate) setSelectedDate(draft.selectedDate);
        if (draft.selectedPlan) setSelectedPlan(draft.selectedPlan);
        if (draft.screening) setScreening(draft.screening);
        if (draft.selectedSlot) setSelectedSlot(draft.selectedSlot);
        if (draft.details) {
          setDetails((prev) => ({
            ...prev,
            ...draft.details,
          }));
        }
        if (session?.user) {
          setStep(4);
        }
      }
    }
  }, [session]);

  const handleRedirectToAuth = (type: "login" | "register") => {
    if (typeof window === "undefined") return;
    saveBookingDraft(HIJAMA_BOOKING_DRAFT_KEY, {
      gender,
      selectedDate,
      selectedPlan,
      screening,
      selectedSlot,
      details,
    });
    const currentPath = window.location.pathname + window.location.hash;
    const targetUrl = buildAuthUrl(type, {
      redirect: currentPath,
      resumeBooking: "hijama",
    });
    router.push(targetUrl);
  };`;

code = code.replace(oldStateRegex, newState);

code = code.replace(
  'onBookingSuccess?.(json.data);',
  'clearBookingDraft(HIJAMA_BOOKING_DRAFT_KEY);\n      onBookingSuccess?.(json.data);'
);

const oldHandlersRegex = /  \/\/ Step 4 Authentication Gate Handlers[\s\S]*?  \/\/ WhatsApp Pre-filled message link/;
code = code.replace(oldHandlersRegex, '  // WhatsApp Pre-filled message link');

const step4OldBlockRegex = /\{\!session\?\.user \? \([\s\S]*?\)\s*:\s*isStaff \? \(/;
const step4NewBlock = `{!session?.user ? (
              <div className="space-y-4 max-w-md mx-auto py-2">
                <div className="flex items-start gap-3 rounded-2xl border border-success-line bg-success-soft p-5 text-xs">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="space-y-1">
                    <strong className="block text-sm font-bold text-ink">
                      Account Required to Reserve Slot
                    </strong>
                    <span className="text-ink-body leading-relaxed block">
                      An account is required to generate your official clinical appointment ticket, issue SMS/WhatsApp reminders, and keep your Sunnah cupping history secure.
                    </span>
                    <span className="text-secondary-text font-medium block pt-1">
                      Your selected wing, date, package, and slot will stay saved while you authenticate.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleRedirectToAuth("register")}
                    className="w-full rounded-xl bg-primary px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-brand-green-800 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRedirectToAuth("login")}
                    className="w-full rounded-xl border border-line-strong bg-white px-4 py-3 text-xs font-bold uppercase tracking-wider text-ink shadow-xs transition-all hover:bg-surface flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : isStaff ? (`;

code = code.replace(step4OldBlockRegex, step4NewBlock);

const bottomOldRegex = /  const authModal = \([\s\S]*?\n  \);\n\n  if \(isInline\) \{[\s\S]*?\n  \}/;
const bottomNew = `  if (isInline) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {content}
    </div>
  );`;

code = code.replace(bottomOldRegex, bottomNew);

fs.writeFileSync('app/components/hijama/HijamaBookingModal.tsx', code, 'utf8');
console.log('Successfully updated HijamaBookingModal.tsx');
