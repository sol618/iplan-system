import { useState } from "react";
import { BookOpen, HelpCircle, X } from "lucide-react";

// ── 가상 학부모 회원정보 DB (localStorage 기반) ────────────────────
const DEFAULT_PARENT_USERS = [
  { name: "홍길동", userId: "parent123", phone: "01012345678", academy: "태비태권도", childName: "홍지우", password: "password123!" },
  { name: "김철수", userId: "chulsoo456", phone: "01098765432", academy: "아이플랜어학원", childName: "김민재", password: "securePass1@" },
  { name: "이영희", userId: "younghee789", phone: "01045678901", academy: "아이플랜수학학원", childName: "이서연", password: "myPassword3#" }
];

type ParentUser = typeof DEFAULT_PARENT_USERS[0];

function getParentUsers(): ParentUser[] {
  try {
    const stored = localStorage.getItem("iplan-users");
    return stored ? JSON.parse(stored) : [...DEFAULT_PARENT_USERS];
  } catch {
    return [...DEFAULT_PARENT_USERS];
  }
}

function saveParentUsers(users: ParentUser[]): void {
  localStorage.setItem("iplan-users", JSON.stringify(users));
}
// ──────────────────────────────────────────────────────────────────

export function AuthPage ({onLogin}: {onLogin: (userType: "parent" | "academy", academyId?: string, userId?: string, name?: string) => void}) {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<"parent" | "academy">("parent");

  return (
    <div className="size-full flex items-start justify-center bg-background overflow-y-auto">
      <div className="w-full max-w-lg px-8 py-10 my-auto">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-14">
          <BookOpen className="w-10 h-10 text-primary" strokeWidth={2} />
          <span className="text-4xl font-bold text-foreground">아이플랜</span>
        </div>

        {/* User Type Toggle */}
        <div className="flex gap-2 mb-10 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setUserType("parent")}
            className={`flex-1 py-3 text-lg font-medium rounded-md transition-all ${
              userType === "parent"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            학부모
          </button>
          <button
            onClick={() => setUserType("academy")}
            className={`flex-1 py-3 text-lg font-medium rounded-md transition-all ${
              userType === "academy"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            학원
          </button>
        </div>

        {userType === "parent" ? (
          <ParentAuthForm isLogin={isLogin} setIsLogin={setIsLogin} onLogin={onLogin} />
        ) : (
          <AcademyRegistrationForm onLogin={onLogin}/>
        )}
      </div>
    </div>
  );
}

function ParentAuthForm({
  isLogin,
  setIsLogin,
  onLogin,
}: {
  isLogin: boolean;
  setIsLogin: (value: boolean) => void;
  onLogin: (userType: "parent" | "academy", academyId?: string, userId?: string, name?: string) => void;
}) {
  const [showHelp, setShowHelp] = useState(false);
  
  // 버튼 클릭(제출) 시점에만 검증된 결과를 담아줄 에러 상태 객체
  const [errors, setErrors] = useState({
    name: "",
    userId: "",
    phone: "",
    academy: "",
    childName: "",
    password: "",
    confirmPassword: "",
    loginError: ""
  });

  // 제출 시점에만 검증을 수행하는 핸들러
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const userIdInput = form.querySelector("#userId") as HTMLInputElement;
    const passwordInput = form.querySelector("#password") as HTMLInputElement;

    if (isLogin) {
      let currentErrors = { name: "", userId: "", phone: "", academy: "", childName: "", password: "", confirmPassword: "", loginError: "" };
      let isValid = true;

      if (!userIdInput.value.trim()) {
        currentErrors.userId = "아이디를 입력해 주세요.";
        isValid = false;
      }
      if (!passwordInput.value) {
        currentErrors.password = "비밀번호를 입력해 주세요.";
        isValid = false;
      }

      if (isValid) {
        const users = getParentUsers();
        const user = users.find(
          (u) => u.userId === userIdInput.value && u.password === passwordInput.value
        );
        if (user) {
          onLogin("parent", undefined, user.userId, user.name);
          return;
        } else {
          currentErrors.loginError = "아이디 또는 비밀번호가 일치하지 않습니다. 다시 확인해 주세요.";
          isValid = false;
        }
      }
      
      setErrors(currentErrors);
      return;
    }

    const nameInput = form.querySelector("#name") as HTMLInputElement;
    const phoneInput = form.querySelector("#phone") as HTMLInputElement;
    const academyInput = form.querySelector("#academyNameInput") as HTMLInputElement;
    const childNameInput = form.querySelector("#childName") as HTMLInputElement;
    const confirmPasswordInput = form.querySelector("#confirmPassword") as HTMLInputElement;

    // 1. 에러 객체 초기화
    let currentErrors = {
      name: "",
      userId: "",
      phone: "",
      academy: "",
      childName: "",
      password: "",
      confirmPassword: "",
      loginError: ""
    };
    let isValid = true;

    // 2. 이름 검증
    if (!nameInput.value.trim()) {
      currentErrors.name = "이름을 입력해 주세요.";
      isValid = false;
    } else if (!/^[가-힣a-zA-Z]+$/.test(nameInput.value)) {
      currentErrors.name = "이름은 한글 또는 영문으로만 입력해 주세요.";
      isValid = false;
    }

    // 3. 아이디 검증 (기존 미입력/자릿수/형식/중복 검사 통합)
    const MOCK_DUPLICATE_IDS = ["admin123", "test123", "user123", "iplan123"];
    const existingUsers = getParentUsers();
    if (!userIdInput.value.trim()) {
      currentErrors.userId = "아이디를 입력해 주세요.";
      isValid = false;
    } else if (userIdInput.value.length < 6) {
      currentErrors.userId = "최소 6글자 이상 입력해 주세요.";
      isValid = false;
    } else if (!/^[A-Za-z0-9]+$/.test(userIdInput.value)) {
      currentErrors.userId = "아이디는 영문, 숫자만 입력 가능합니다.";
      isValid = false;
    } else if (MOCK_DUPLICATE_IDS.includes(userIdInput.value.toLowerCase()) || existingUsers.some(u => u.userId === userIdInput.value)) {
      currentErrors.userId = "중복된 아이디 입니다.";
      isValid = false;
    }

    // 4. 전화번호 검증
    if (!phoneInput.value.trim()) {
      currentErrors.phone = "전화번호를 입력해 주세요.";
      isValid = false;
    } else if (!/^\d{11}$/.test(phoneInput.value)) {
      currentErrors.phone = "올바른 휴대폰 번호 11자리를 입력해 주세요.";
      isValid = false;
    }

    // 5. 등록된 학원 검사
    const MOCK_REGISTERED_ACADEMIES = ["태비태권도", "아이플랜어학원", "아이플랜수학학원"];
    const normalizedAcademy = academyInput.value.replace(/\s+/g, '');
    if (!academyInput.value.trim()) {
      currentErrors.academy = "학원 이름을 입력해 주세요.";
      isValid = false;
    } else if (normalizedAcademy && !MOCK_REGISTERED_ACADEMIES.includes(normalizedAcademy)) {
      currentErrors.academy = "미등록된 학원입니다.";
      isValid = false;
    }

    // 6. 자녀 이름 검증
    if (!childNameInput.value.trim()) {
      currentErrors.childName = "자녀 이름을 입력해 주세요.";
      isValid = false;
    } else if (!/^[가-힣a-zA-Z]+$/.test(childNameInput.value)) {
      currentErrors.childName = "자녀 이름은 한글 또는 영문으로만 입력해 주세요.";
      isValid = false;
    }

    // 7. 비밀번호 검증 (미입력/자릿수/한글 포함 여부)
    if (!passwordInput.value) {
      currentErrors.password = "비밀번호를 입력해 주세요.";
      isValid = false;
    } else if (passwordInput.value.length < 6) {
      currentErrors.password = "최소 6글자 이상 입력해 주세요.";
      isValid = false;
    } else if (/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(passwordInput.value)) {
      currentErrors.password = "한글은 입력할 수 없습니다. 영어로 입력해 주세요.";
      isValid = false;
    }

    // 8. 비밀번호 일치 검사
    if (!confirmPasswordInput.value) {
      currentErrors.confirmPassword = "비밀번호 확인을 입력해 주세요.";
      isValid = false;
    } else if (passwordInput.value !== confirmPasswordInput.value) {
      currentErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
      isValid = false;
    }

    // 취합된 에러 상태를 한 번에 업데이트 (화면에 반영됨)
    setErrors(currentErrors);

    // 에러가 없을 때만 성공 콜백 함수 실행
    if (isValid) {
      const users = getParentUsers();
      users.push({
        name: nameInput.value.trim(),
        userId: userIdInput.value.trim(),
        phone: phoneInput.value.trim(),
        academy: academyInput.value.trim(),
        childName: childNameInput.value.trim(),
        password: passwordInput.value,
      });
      saveParentUsers(users);
      alert("회원가입이 완료되었습니다. 로그인해 주세요.");
      setIsLogin(true);
      form.reset();
    }
  };

  // 사용자가 다시 타이핑을 시작하면 해당 필드의 에러 표시를 실시간으로 지워주는 헬퍼
  const handleInputChange = (field: keyof typeof errors) => {
    setErrors(prev => ({
      ...prev,
      [field]: "",
      ...(field === "userId" || field === "password" ? { loginError: "" } : {})
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">{isLogin ? "로그인" : "회원가입"}</h1>
          {!isLogin && (
            <button
              type="button"
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-1 text-primary hover:opacity-80 transition-opacity"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="text-sm">도움이 필요하세요?</span>
            </button>
          )}
        </div>
        <p className="text-lg text-muted-foreground">
          {isLogin ? "자녀의 학원 일정을 관리하세요" : "학부모 계정을 생성하세요"}
        </p>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
              <h2 className="text-foreground">회원가입 안내</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="text-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                      1
                    </div>
                    <div>
                      <h3 className="text-foreground mb-2">기본 정보 입력</h3>
                      <p className="text-muted-foreground text-sm">
                        학부모님의 이름, 아이디, 전화번호를 입력해주세요.
                        아이디는 로그인 시 사용됩니다.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                      2
                    </div>
                    <div>
                      <h3 className="text-foreground mb-2">학원 및 자녀 정보</h3>
                      <p className="text-muted-foreground text-sm">
                        자녀가 다니는 학원 이름과 자녀의 이름을 입력해주세요.
                        학원 일정을 확인하기 위해 필요한 정보입니다.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                      3
                    </div>
                    <div>
                      <h3 className="text-foreground mb-2">비밀번호 설정</h3>
                      <p className="text-muted-foreground text-sm">
                        안전한 비밀번호를 설정해주세요.
                        비밀번호는 8자 이상 권장되며, 동일하게 두 번 입력해주세요.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                      4
                    </div>
                    <div>
                      <h3 className="text-foreground mb-2">회원가입 완료</h3>
                      <p className="text-muted-foreground text-sm">
                        '회원가입' 버튼을 클릭하면 가입이 완료됩니다.
                        이후 로그인하여 자녀의 학원 일정을 관리할 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <h3 className="text-foreground mb-2 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  <span>추가 도움이 필요하신가요?</span>
                </h3>
                <p className="text-muted-foreground text-sm">
                  문의사항이 있으시다면 help@gmail.com으로 연락주세요.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 브라우저 기본 말풍선 차단을 위해 noValidate 속성 유지 */}
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {isLogin && errors.loginError && (
          <div className="border border-destructive bg-destructive/10 rounded-lg px-4 py-3 mb-4">
            <p className="text-sm font-medium text-destructive">{errors.loginError}</p>
          </div>
        )}

        {!isLogin && (
          <div>
            <label htmlFor="name" className="block mb-3 text-lg font-medium text-foreground">
              이름 <span className="text-destructive">*</span>
            </label>
            <input
              id="name"
              type="text"
              placeholder="홍길동"
              onInput={() => handleInputChange("name")}
              className={`w-full px-5 py-4 text-lg bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.name ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
            />
            {errors.name && (
              <p className="mt-1.5 text-sm font-medium text-destructive">{errors.name}</p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="userId" className="block mb-3 text-lg font-medium text-foreground">
            아이디 {!isLogin && <span className="text-destructive">*</span>}
          </label>
          <input
            id="userId"
            type="text"
            placeholder="myid123"
            onInput={() => handleInputChange("userId")}
            className={`w-full px-5 py-4 text-lg bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.userId ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
          />
          {errors.userId && (
            <p className="mt-1.5 text-sm font-medium text-destructive">{errors.userId}</p>
          )}
        </div>

        {!isLogin && (
          <div>
            <label htmlFor="phone" className="block mb-3 text-lg font-medium text-foreground">
              전화번호 <span className="text-destructive">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="01012345678"
              maxLength={11}
              onInput={() => handleInputChange("phone")}
              className={`w-full px-5 py-4 text-lg bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.phone ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
            />
            {!errors.phone && (
              <p className="mt-1.5 text-xs text-muted-foreground">기호 없이 숫자 11자리를 입력해 주세요. (예: 01012345678)</p>
            )}
            {errors.phone && (
              <p className="mt-1.5 text-sm font-medium text-destructive">{errors.phone}</p>
            )}
          </div>
        )}

        {!isLogin && (
          <div className="pt-4 border-t border-border">
            <h3 className="mb-4 text-foreground">학원 및 자녀 정보</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="academyNameInput" className="block mb-3 text-lg font-medium text-foreground">
                  등록할 학원 이름 <span className="text-destructive">*</span>
                </label>
                <input
                  id="academyNameInput"
                  type="text"
                  placeholder="OO학원"
                  onInput={() => handleInputChange("academy")}
                  className={`w-full px-5 py-4 text-lg bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.academy ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
                />
                {errors.academy && (
                  <p className="mt-1.5 text-sm font-medium text-destructive">{errors.academy}</p>
                )}
              </div>

              <div>
                <label htmlFor="childName" className="block mb-3 text-lg font-medium text-foreground">
                  자녀 이름 <span className="text-destructive">*</span>
                </label>
                <input
                  id="childName"
                  type="text"
                  placeholder="홍아무개"
                  onInput={() => handleInputChange("childName")}
                  className={`w-full px-5 py-4 text-lg bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.childName ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
                />
                {errors.childName && (
                  <p className="mt-1.5 text-sm font-medium text-destructive">{errors.childName}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className={!isLogin ? "pt-4 border-t border-border" : ""}>
          <label htmlFor="password" className="block mb-3 text-lg font-medium text-foreground">
            비밀번호 {!isLogin && <span className="text-destructive">*</span>}
          </label>
          <input
            id="password"
            type="text"
            placeholder="••••••••"
            style={{ WebkitTextSecurity: "disc" } as React.CSSProperties}
            onInput={() => handleInputChange("password")}
            className={`w-full px-5 py-4 text-lg bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.password ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
          />
          {!isLogin && !errors.password && (
            <p className="mt-1.5 text-xs text-muted-foreground">영어, 숫자, 특수문자(!@#$% 등)를 사용하여 최소 6글자 이상 입력해 주세요.</p>
          )}
          {errors.password && (
            <p className="mt-1.5 text-sm font-medium text-destructive">{errors.password}</p>
          )}
        </div>

        {!isLogin && (
          <div>
            <label
              htmlFor="confirmPassword"
              className="block mb-3 text-lg font-medium text-foreground"
            >
              비밀번호 확인 <span className="text-destructive">*</span>
            </label>
            <input
              id="confirmPassword"
              type="text"
              placeholder="••••••••"
              style={{ WebkitTextSecurity: "disc" } as React.CSSProperties}
              onInput={() => handleInputChange("confirmPassword")}
              className={`w-full px-5 py-4 text-lg bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.confirmPassword ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
            />
            {errors.confirmPassword && (
              <p className="mt-1.5 text-sm font-medium text-destructive">{errors.confirmPassword}</p>
            )}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-4 text-xl font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity mt-8"
        >
          {isLogin ? "로그인" : "회원가입"}
        </button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setErrors({
              name: "",
              userId: "",
              phone: "",
              academy: "",
              childName: "",
              password: "",
              confirmPassword: "",
              loginError: ""
            });
          }}
          className="text-lg text-muted-foreground hover:text-foreground transition-colors"
        >
          {isLogin ? "계정이 없으신가요? " : "이미 계정이 있으신가요? "}
          <span className="text-primary">{isLogin ? "회원가입" : "로그인"}</span>
        </button>
      </div>
    </div>
  );
}

// ── 가상 학원 회원정보 DB (더미 데이터) ───────────────────────────
let MOCK_ACADEMY_USERS = [
  { academyName: "태비태권도", academyAddress: "서울시강남구테헤란로123", academyPhone: "0212345678", subjects: "태권도", managerName: "이관장", managerId: "academy123", managerPhone: "01011112222", password: "password123!", academyId: "taebee" },
  { academyName: "아이플랜어학원", academyAddress: "서울시서초구반포대로456", academyPhone: "0298765432", subjects: "영어", managerName: "김원장", managerId: "english456", managerPhone: "01033334444", password: "securePass1@", academyId: "iplan-english" }
];
// ──────────────────────────────────────────────────────────────────

// ── 가상 학원 인증 API (더미 데이터) ──────────────────────────────
const MOCK_ACADEMY_API = [
  { id: "acad-001", name: "태비태권도",       address: "서울시강남구테헤란로123",    phone: "0212345678"  },
  { id: "acad-002", name: "아이플랜어학원",   address: "서울시서초구반포대로456",    phone: "0298765432"  },
  { id: "acad-003", name: "아이플랜수학학원", address: "경기도성남시분당구판교로789", phone: "0317654321"  },
  { id: "acad-004", name: "브레인영어학원",   address: "서울시마포구홍익로55",       phone: "0223456789"  },
  { id: "acad-005", name: "스타과학학원",     address: "인천시남동구구월동100번길",  phone: "0321234567"  },
];
// ──────────────────────────────────────────────────────────────────

function AcademyRegistrationForm({onLogin}:{onLogin:(userType: "parent" | "academy", academyId?: string, userId?: string, name?: string)=>void}) {
  const [isAcademyLogin, setIsAcademyLogin] = useState(true);

  // 학원 정보 에러 state
  const [acadErrors, setAcadErrors] = useState({
    academyName: "",
    academyAddress: "",
    academyPhone: "",
    subjects: "",
    academyMatch: "",
  });

  // 등록자 정보 에러 state
  const [regErrors, setRegErrors] = useState({
    managerName: "",
    managerId: "",
    managerPhone: "",
    managerPassword: "",
    managerConfirmPassword: "",
    loginError: "",
  });

  const handleAcadInputChange = (field: keyof typeof acadErrors) => {
    if (acadErrors[field]) {
      setAcadErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleRegInputChange = (field: keyof typeof regErrors) => {
    setRegErrors(prev => ({
      ...prev,
      [field]: "",
      ...(field === "managerId" || field === "managerPassword" ? { loginError: "" } : {})
    }));
  };

  const handleAcademySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;

    if (isAcademyLogin) {
      const academyUserIdInput = form.querySelector("#academyUserId") as HTMLInputElement;
      const academyPasswordInput = form.querySelector("#academyPassword") as HTMLInputElement;

      let currentErrors = { managerName: "", managerId: "", managerPhone: "", managerPassword: "", managerConfirmPassword: "", loginError: "" };
      let isValid = true;

      if (!academyUserIdInput.value.trim()) {
        currentErrors.managerId = "아이디를 입력해 주세요.";
        isValid = false;
      }
      if (!academyPasswordInput.value) {
        currentErrors.managerPassword = "비밀번호를 입력해 주세요.";
        isValid = false;
      }

      if (isValid) {
        const user = MOCK_ACADEMY_USERS.find(
          (u) => u.managerId === academyUserIdInput.value && u.password === academyPasswordInput.value
        );
        if (user) {
          onLogin("academy", user.academyId, user.managerId, user.academyName);
          return;
        } else {
          currentErrors.loginError = "아이디 또는 비밀번호가 일치하지 않습니다. 다시 확인해 주세요.";
          isValid = false;
        }
      }

      setRegErrors(currentErrors);
      return;
    }

    const managerNameInput   = form.querySelector("#managerName")            as HTMLInputElement;
    const managerIdInput     = form.querySelector("#managerUserId")          as HTMLInputElement;
    const managerPhoneInput  = form.querySelector("#managerPhone")           as HTMLInputElement;
    const managerPwInput     = form.querySelector("#managerPassword")        as HTMLInputElement;
    const managerCfmPwInput  = form.querySelector("#managerConfirmPassword") as HTMLInputElement;

    const academyNameInput  = form.querySelector("#academyAddressInput") as HTMLInputElement;
    const academyAddrInput  = form.querySelector("#academyAddress")      as HTMLInputElement;
    const academyPhoneInput = form.querySelector("#academyPhone")        as HTMLInputElement;
    const subjectsInput     = form.querySelector("#subjects")            as HTMLInputElement;

    // ── 학원 정보 섹션 검증 ──
    let acadCurrentErrors = {
      academyName: "",
      academyAddress: "",
      academyPhone: "",
      subjects: "",
      academyMatch: "",
    };
    let acadValid = true;

    // 1. 빈칸 오류
    if (!academyNameInput.value.trim()) {
      acadCurrentErrors.academyName = "학원명을 입력해 주세요.";
      acadValid = false;
    } else if (academyNameInput.value.trim().length < 2) {
      // 2. 범위: 최소 2자 이상
      acadCurrentErrors.academyName = "학원명은 최소 2글자 이상 입력해 주세요.";
      acadValid = false;
    } else if (/[ㄱ-ㅎㅏ-ㅣ]/.test(academyNameInput.value)) {
      // 3. 단일 자모(ㅇㅇ 등) 포함 불가 — 등록자 이름과 동일한 범위 조건
      acadCurrentErrors.academyName = "학원명은 올바른 형식으로 입력해 주세요. (예: 아이플랜학원)";
      acadValid = false;
    }

    if (!academyAddrInput.value.trim()) {
      acadCurrentErrors.academyAddress = "주소를 입력해 주세요.";
      acadValid = false;
    } else if (academyAddrInput.value.trim().length < 5) {
      acadCurrentErrors.academyAddress = "주소는 최소 5글자 이상 입력해 주세요.";
      acadValid = false;
    } else if (/[ㄱ-ㅎㅏ-ㅣ]/.test(academyAddrInput.value)) {
      // 자모 단독 입력(ㅇㅇ 등) 거부 — 등록자 이름과 동일한 범위 조건
      acadCurrentErrors.academyAddress = "주소는 올바른 형식으로 입력해 주세요. (예: 서울시 강남구 테헤란로 123)";
      acadValid = false;
    } else if (/[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]/.test(academyAddrInput.value)) {
      acadCurrentErrors.academyAddress = "주소에 특수문자는 입력할 수 없습니다.";
      acadValid = false;
    }

    if (!academyPhoneInput.value.trim()) {
      acadCurrentErrors.academyPhone = "학원 전화번호를 입력해 주세요.";
      acadValid = false;
    } else if (!/^[0-9\-]+$/.test(academyPhoneInput.value)) {
      acadCurrentErrors.academyPhone = "전화번호는 숫자와 하이픈(-)만 입력 가능합니다.";
      acadValid = false;
    } else if (academyPhoneInput.value.replace(/[^0-9]/g, "").length < 8) {
      acadCurrentErrors.academyPhone = "전화번호가 너무 짧습니다. 올바른 번호를 입력해 주세요.";
      acadValid = false;
    }

    if (!subjectsInput.value.trim()) {
      acadCurrentErrors.subjects = "교육 과목을 입력해 주세요.";
      acadValid = false;
    } else if (subjectsInput.value.trim().length < 2) {
      acadCurrentErrors.subjects = "교육 과목은 최소 2글자 이상 입력해 주세요.";
      acadValid = false;
    } else if (/[0-9]/.test(subjectsInput.value)) {
      acadCurrentErrors.subjects = "교육 과목에 숫자는 입력할 수 없습니다.";
      acadValid = false;
    }

    // 5·6. 학원 인증 API 일치 확인 (공백 제거 후 비교)
    if (acadValid) {
      const normalize = (s: string) => s.replace(/\s+/g, "");
      const inputName  = normalize(academyNameInput.value);
      const inputAddr  = normalize(academyAddrInput.value);
      const inputPhone = normalize(academyPhoneInput.value).replace(/-/g, "");

      const matched = MOCK_ACADEMY_API.find(
        (acad) =>
          normalize(acad.name)    === inputName &&
          normalize(acad.address) === inputAddr &&
          acad.phone              === inputPhone
      );

      if (!matched) {
        acadCurrentErrors.academyMatch = "입력하신 학원 정보가 등록된 정보와 일치하지 않습니다. 학원명, 주소, 전화번호를 다시 확인해 주세요.";
        acadValid = false;
      }
    }

    setAcadErrors(acadCurrentErrors);

    if (!acadValid) return;

    let currentErrors = {
      managerName: "",
      managerId: "",
      managerPhone: "",
      managerPassword: "",
      managerConfirmPassword: "",
      loginError: "",
    };
    let isValid = true;

    if (!managerNameInput.value.trim()) {
      currentErrors.managerName = "담당자 이름을 입력해 주세요.";
      isValid = false;
    } else if (!/^[가-힣a-zA-Z]+$/.test(managerNameInput.value)) {
      currentErrors.managerName = "이름은 한글 또는 영문으로만 입력해 주세요.";
      isValid = false;
    }

    const MOCK_DUPLICATE_IDS = ["admin123", "test1234", "user123", "iplan123", "admin123", "test123", "manager1", "academy1"];
    if (!managerIdInput.value.trim()) {
      currentErrors.managerId = "아이디를 입력해 주세요.";
      isValid = false;
    } else if (managerIdInput.value.length < 6) {
      currentErrors.managerId = "최소 6글자 이상 입력해 주세요.";
      isValid = false;
    } else if (!/^[A-Za-z0-9]+$/.test(managerIdInput.value)) {
      currentErrors.managerId = "아이디는 영문, 숫자만 입력 가능합니다.";
      isValid = false;
    } else if (MOCK_DUPLICATE_IDS.includes(managerIdInput.value.toLowerCase())) {
      currentErrors.managerId = "중복된 아이디 입니다.";
      isValid = false;
    }

    if (!managerPhoneInput.value.trim()) {
      currentErrors.managerPhone = "연락처를 입력해 주세요.";
      isValid = false;
    } else if (!/^\d{11}$/.test(managerPhoneInput.value)) {
      currentErrors.managerPhone = "올바른 휴대폰 번호 11자리를 입력해 주세요.";
      isValid = false;
    }

    if (!managerPwInput.value) {
      currentErrors.managerPassword = "비밀번호를 입력해 주세요.";
      isValid = false;
    } else if (managerPwInput.value.length < 6) {
      currentErrors.managerPassword = "최소 6글자 이상 입력해 주세요.";
      isValid = false;
    } else if (/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(managerPwInput.value)) {
      currentErrors.managerPassword = "한글은 입력할 수 없습니다. 영어로 입력해 주세요.";
      isValid = false;
    }

    if (!managerCfmPwInput.value) {
      currentErrors.managerConfirmPassword = "비밀번호 확인을 입력해 주세요.";
      isValid = false;
    } else if (managerPwInput.value !== managerCfmPwInput.value) {
      currentErrors.managerConfirmPassword = "비밀번호가 일치하지 않습니다.";
      isValid = false;
    }

    setRegErrors(currentErrors);

    if (isValid) {
      MOCK_ACADEMY_USERS.push({
        academyName: academyNameInput.value.trim(),
        academyAddress: academyAddrInput.value.trim(),
        academyPhone: academyPhoneInput.value.trim(),
        subjects: subjectsInput.value.trim(),
        managerName: managerNameInput.value.trim(),
        managerId: managerIdInput.value.trim(),
        managerPhone: managerPhoneInput.value.trim(),
        password: managerPwInput.value,
        academyId: `acad-${Date.now()}`,
      });
      alert("학원 등록이 완료되었습니다. 로그인해 주세요.");
      setIsAcademyLogin(true);
      form.reset();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-3">{isAcademyLogin ? "학원 로그인" : "학원 등록"}</h1>
        <p className="text-lg text-muted-foreground">
          {isAcademyLogin
            ? "학원 관리자 계정으로 로그인하세요"
            : "학원 정보와 담당자 정보를 입력하세요"}
        </p>
      </div>

      {isAcademyLogin ? (
        <form className="space-y-4" onSubmit={handleAcademySubmit} noValidate>
          {regErrors.loginError && (
            <div className="border border-destructive bg-destructive/10 rounded-lg px-4 py-3 mb-4">
              <p className="text-sm font-medium text-destructive">{regErrors.loginError}</p>
            </div>
          )}
          <div>
            <label htmlFor="academyUserId" className="block mb-3 text-lg font-medium text-foreground">
              아이디
            </label>
            <input
              id="academyUserId"
              type="text"
              placeholder="myid123"
              onInput={() => handleRegInputChange("managerId")}
              className={`w-full px-5 py-4 text-lg bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${regErrors.managerId ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
            />
            {regErrors.managerId && (
              <p className="mt-1.5 text-sm font-medium text-destructive">{regErrors.managerId}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="academyPassword"
              className="block mb-3 text-lg font-medium text-foreground"
            >
              비밀번호
            </label>
            <input
              id="academyPassword"
              type="text"
              placeholder="••••••••"
              style={{ WebkitTextSecurity: "disc" } as React.CSSProperties}
              onInput={() => handleRegInputChange("managerPassword")}
              className={`w-full px-5 py-4 text-lg bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${regErrors.managerPassword ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
            />
            {regErrors.managerPassword && (
              <p className="mt-1.5 text-sm font-medium text-destructive">{regErrors.managerPassword}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-4 text-xl font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity mt-8"
          >
            로그인
          </button>
        </form>
      ) : (
        <form className="space-y-6" onSubmit={handleAcademySubmit} noValidate>
          <div className="space-y-4">
            <h2 className="text-foreground">학원 정보</h2>

            {/* 학원 인증 불일치 공통 오류 */}
            {acadErrors.academyMatch && (
              <div className="border border-destructive bg-destructive/10 rounded-lg px-4 py-3">
                <p className="text-sm font-medium text-destructive">{acadErrors.academyMatch}</p>
              </div>
            )}

            {/* 학원명 */}
            <div>
              <label htmlFor="academyAddressInput" className="block mb-3 text-lg font-medium text-foreground">
                학원명 <span className="text-destructive">*</span>
              </label>
              <input
                id="academyAddressInput"
                type="text"
                placeholder="OO학원"
                onInput={() => handleAcadInputChange("academyName")}
                className={`w-full px-5 py-4 text-lg bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${acadErrors.academyName ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
              />
              {acadErrors.academyName && (
                <p className="mt-1.5 text-sm font-medium text-destructive">{acadErrors.academyName}</p>
              )}
            </div>

            {/* 주소 */}
            <div>
              <label htmlFor="academyAddress" className="block mb-3 text-lg font-medium text-foreground">
                주소 <span className="text-destructive">*</span>
              </label>
              <input
                id="academyAddress"
                type="text"
                placeholder="서울시 강남구 테헤란로 123"
                onInput={() => handleAcadInputChange("academyAddress")}
                className={`w-full px-5 py-4 text-lg bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${acadErrors.academyAddress ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
              />
              {acadErrors.academyAddress && (
                <p className="mt-1.5 text-sm font-medium text-destructive">{acadErrors.academyAddress}</p>
              )}
            </div>

            {/* 학원 전화번호 */}
            <div>
              <label htmlFor="academyPhone" className="block mb-3 text-lg font-medium text-foreground">
                학원 전화번호 <span className="text-destructive">*</span>
              </label>
              <input
                id="academyPhone"
                type="tel"
                placeholder="02-1234-5678"
                onInput={() => handleAcadInputChange("academyPhone")}
                className={`w-full px-5 py-4 text-lg bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${acadErrors.academyPhone ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
              />
              {!acadErrors.academyPhone && (
                <p className="mt-1.5 text-xs text-muted-foreground">예: 0212345678</p>
              )}
              {acadErrors.academyPhone && (
                <p className="mt-1.5 text-sm font-medium text-destructive">{acadErrors.academyPhone}</p>
              )}
            </div>

            {/* 교육 과목 */}
            <div>
              <label htmlFor="subjects" className="block mb-3 text-lg font-medium text-foreground">
                교육 과목 <span className="text-destructive">*</span>
              </label>
              <input
                id="subjects"
                type="text"
                placeholder="수학, 영어, 과학"
                onInput={() => handleAcadInputChange("subjects")}
                className={`w-full px-5 py-4 text-lg bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${acadErrors.subjects ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
              />
              {acadErrors.subjects && (
                <p className="mt-1.5 text-sm font-medium text-destructive">{acadErrors.subjects}</p>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <h2 className="text-foreground">등록자 정보</h2>

            <div>
              <label htmlFor="managerName" className="block mb-3 text-lg font-medium text-foreground">
                담당자 이름 <span className="text-destructive">*</span>
              </label>
              <input
                id="managerName"
                type="text"
                placeholder="홍길동"
                onInput={() => handleRegInputChange("managerName")}
                className={`w-full px-5 py-4 text-lg bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${regErrors.managerName ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
              />
              {regErrors.managerName && (
                <p className="mt-1.5 text-sm font-medium text-destructive">{regErrors.managerName}</p>
              )}
            </div>

            <div>
              <label htmlFor="managerUserId" className="block mb-3 text-lg font-medium text-foreground">
                아이디 <span className="text-destructive">*</span>
              </label>
              <input
                id="managerUserId"
                type="text"
                placeholder="myid123"
                onInput={() => handleRegInputChange("managerId")}
                className={`w-full px-5 py-4 text-lg bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${regErrors.managerId ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
              />
              {regErrors.managerId && (
                <p className="mt-1.5 text-sm font-medium text-destructive">{regErrors.managerId}</p>
              )}
            </div>

            <div>
              <label htmlFor="managerPhone" className="block mb-3 text-lg font-medium text-foreground">
                연락처 <span className="text-destructive">*</span>
              </label>
              <input
                id="managerPhone"
                type="tel"
                placeholder="01012345678"
                maxLength={11}
                onInput={() => handleRegInputChange("managerPhone")}
                className={`w-full px-5 py-4 text-lg bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${regErrors.managerPhone ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
              />
              {!regErrors.managerPhone && (
                <p className="mt-1.5 text-xs text-muted-foreground">기호 없이 숫자 11자리를 입력해 주세요. (예: 01012345678)</p>
              )}
              {regErrors.managerPhone && (
                <p className="mt-1.5 text-sm font-medium text-destructive">{regErrors.managerPhone}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="managerPassword"
                className="block mb-3 text-lg font-medium text-foreground"
              >
                비밀번호 <span className="text-destructive">*</span>
              </label>
              <input
                id="managerPassword"
                type="text"
                placeholder="••••••••"
                style={{ WebkitTextSecurity: "disc" } as React.CSSProperties}
                onInput={() => handleRegInputChange("managerPassword")}
                className={`w-full px-5 py-4 text-lg bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${regErrors.managerPassword ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
              />
              {!regErrors.managerPassword && (
                <p className="mt-1.5 text-xs text-muted-foreground">영어, 숫자, 특수문자(!@#$% 등)를 사용하여 최소 6글자 이상 입력해 주세요.</p>
              )}
              {regErrors.managerPassword && (
                <p className="mt-1.5 text-sm font-medium text-destructive">{regErrors.managerPassword}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="managerConfirmPassword"
                className="block mb-3 text-lg font-medium text-foreground"
              >
                비밀번호 확인 <span className="text-destructive">*</span>
              </label>
              <input
                id="managerConfirmPassword"
                type="text"
                placeholder="••••••••"
                style={{ WebkitTextSecurity: "disc" } as React.CSSProperties}
                onInput={() => handleRegInputChange("managerConfirmPassword")}
                className={`w-full px-5 py-4 text-lg bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${regErrors.managerConfirmPassword ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
              />
              {regErrors.managerConfirmPassword && (
                <p className="mt-1.5 text-sm font-medium text-destructive">{regErrors.managerConfirmPassword}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 text-xl font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity mt-8"
          >
            학원 등록하기
          </button>
        </form>
      )}

      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            setIsAcademyLogin(!isAcademyLogin);
            setAcadErrors({
              academyName: "",
              academyAddress: "",
              academyPhone: "",
              subjects: "",
              academyMatch: "",
            });
            setRegErrors({
              managerName: "",
              managerId: "",
              managerPhone: "",
              managerPassword: "",
              managerConfirmPassword: "",
              loginError: "",
            });
          }}
          className="text-lg text-muted-foreground hover:text-foreground transition-colors"
        >
          {isAcademyLogin ? "학원을 등록하시나요? " : "이미 등록된 학원이신가요? "}
          <span className="text-primary">
            {isAcademyLogin ? "학원 등록" : "로그인"}
          </span>
        </button>
      </div>
    </div>
  );
}