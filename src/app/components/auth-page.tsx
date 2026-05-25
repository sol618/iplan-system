import { useState } from "react";
import { BookOpen, HelpCircle, X } from "lucide-react";

export function AuthPage ({onLogin}: {onLogin: () => void}) {
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
  onLogin: () => void;
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
    confirmPassword: ""
  });

  // 제출 시점에만 검증을 수행하는 핸들러
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLogin) {
      onLogin();
      return;
    }

    const form = e.currentTarget;
    const nameInput = form.querySelector("#name") as HTMLInputElement;
    const userIdInput = form.querySelector("#userId") as HTMLInputElement;
    const phoneInput = form.querySelector("#phone") as HTMLInputElement;
    const academyInput = form.querySelector("#academyNameInput") as HTMLInputElement;
    const childNameInput = form.querySelector("#childName") as HTMLInputElement;
    const passwordInput = form.querySelector("#password") as HTMLInputElement;
    const confirmPasswordInput = form.querySelector("#confirmPassword") as HTMLInputElement;

    // 1. 에러 객체 초기화
    let currentErrors = {
      name: "",
      userId: "",
      phone: "",
      academy: "",
      childName: "",
      password: "",
      confirmPassword: ""
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
    if (!userIdInput.value.trim()) {
      currentErrors.userId = "아이디를 입력해 주세요.";
      isValid = false;
    } else if (userIdInput.value.length < 6) {
      currentErrors.userId = "최소 6글자 이상 입력해 주세요.";
      isValid = false;
    } else if (!/^[A-Za-z0-9]+$/.test(userIdInput.value)) {
      currentErrors.userId = "아이디는 영문, 숫자만 입력 가능합니다.";
      isValid = false;
    } else if (MOCK_DUPLICATE_IDS.includes(userIdInput.value.toLowerCase())) {
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
      onLogin();
    }
  };

  // 사용자가 다시 타이핑을 시작하면 해당 필드의 에러 표시를 실시간으로 지워주는 헬퍼
  const handleInputChange = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
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
            className={`w-full px-5 py-4 text-lg bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${!isLogin && errors.userId ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
          />
          {!isLogin && errors.userId && (
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
            className={`w-full px-5 py-4 text-lg bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${!isLogin && errors.password ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
          />
          {!isLogin && !errors.password && (
            <p className="mt-1.5 text-xs text-muted-foreground">영어, 숫자, 특수문자(!@#$% 등)를 사용하여 최소 6글자 이상 입력해 주세요.</p>
          )}
          {!isLogin && errors.password && (
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
              confirmPassword: ""
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

function AcademyRegistrationForm({onLogin}:{onLogin:()=>void}) {
  const [isAcademyLogin, setIsAcademyLogin] = useState(true);
  const [managerIdStatus, setManagerIdStatus] = useState<"idle" | "duplicated">("idle");
  const [managerPasswordMatchStatus, setManagerPasswordMatchStatus] = useState<"idle" | "mismatch">("idle");

  const handleAcademySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isAcademyLogin) {
      onLogin();
      return;
    }

    const form = e.currentTarget;
    const managerIdInput = form.querySelector("#managerUserId") as HTMLInputElement;
    const managerPasswordInput = form.querySelector("#managerPassword") as HTMLInputElement;
    const managerConfirmInput = form.querySelector("#managerConfirmPassword") as HTMLInputElement;

    let isValid = true;
    managerIdInput.setCustomValidity("");
    managerPasswordInput.setCustomValidity("");
    managerConfirmInput.setCustomValidity("");

    setManagerIdStatus("idle");
    setManagerPasswordMatchStatus("idle");

    const MOCK_DUPLICATE_IDS = ["admin", "test", "user1", "iplan"];
    if (MOCK_DUPLICATE_IDS.includes(managerIdInput.value.toLowerCase())) {
      setManagerIdStatus("duplicated");
      managerIdInput.setCustomValidity("중복된 아이디 입니다.");
      isValid = false;
    }

    if (/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(managerPasswordInput.value)) {
      managerPasswordInput.setCustomValidity("담당자 비밀번호에 한글이 입력되었습니다. 영어로 입력해 주세요.");
      isValid = false;
    }

    if (managerPasswordInput.value !== managerConfirmInput.value) {
      setManagerPasswordMatchStatus("mismatch");
      managerConfirmInput.setCustomValidity("비밀번호가 일치하지 않습니다.");
      isValid = false;
    }

    if (!form.checkValidity() || !isValid) {
      form.reportValidity();
    } else {
      onLogin();
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
        <form className="space-y-4" onSubmit={handleAcademySubmit}>
          <div>
            <label htmlFor="academyUserId" className="block mb-3 text-lg font-medium text-foreground">
              아이디
            </label>
            <input
              id="academyUserId"
              type="text"
              placeholder="myid123"
              className="w-full px-5 py-4 text-lg bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
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
              className="w-full px-5 py-4 text-lg bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 text-xl font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity mt-8"
          >
            로그인
          </button>
        </form>
      ) : (
        <form className="space-y-6" onSubmit={handleAcademySubmit}>
          <div className="space-y-4">
            <h2 className="text-foreground">학원 정보</h2>

            <div>
              <label htmlFor="academyAddressInput" className="block mb-3 text-lg font-medium text-foreground">
                학원명 <span className="text-destructive">*</span>
              </label>
              <input
                id="academyAddressInput"
                type="text"
                placeholder="OO학원"
                required
                className="w-full px-5 py-4 text-lg bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>

            <div>
              <label htmlFor="academyAddress" className="block mb-3 text-lg font-medium text-foreground">
                주소 <span className="text-destructive">*</span>
              </label>
              <input
                id="academyAddress"
                type="text"
                placeholder="서울시 강남구 테헤란로 123"
                required
                className="w-full px-5 py-4 text-lg bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>

            <div>
              <label htmlFor="academyPhone" className="block mb-3 text-lg font-medium text-foreground">
                학원 전화번호 <span className="text-destructive">*</span>
              </label>
              <input
                id="academyPhone"
                type="tel"
                placeholder="02-1234-5678"
                required
                className="w-full px-5 py-4 text-lg bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>

            <div>
              <label htmlFor="subjects" className="block mb-3 text-lg font-medium text-foreground">
                교육 과목
              </label>
              <input
                id="subjects"
                type="text"
                placeholder="수학, 영어, 과학"
                className="w-full px-5 py-4 text-lg bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
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
                required
                className="w-full px-5 py-4 text-lg bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>

            <div>
              <label htmlFor="managerUserId" className="block mb-3 text-lg font-medium text-foreground">
                아이디 <span className="text-destructive">*</span>
              </label>
              <input
                id="managerUserId"
                type="text"
                placeholder="myid123"
                required
                className={`w-full px-5 py-4 text-lg bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${managerIdStatus === "duplicated" ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
              />
              {managerIdStatus === "duplicated" && (
                <p className="mt-1.5 text-sm font-medium text-destructive">중복된 아이디 입니다</p>
              )}
            </div>

            <div>
              <label htmlFor="managerPhone" className="block mb-3 text-lg font-medium text-foreground">
                연락처 <span className="text-destructive">*</span>
              </label>
              <input
                id="managerPhone"
                type="tel"
                placeholder="010-1234-5678"
                required
                className="w-full px-5 py-4 text-lg bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
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
                required
                style={{ WebkitTextSecurity: "disc" } as React.CSSProperties}
                className="w-full px-5 py-4 text-lg bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
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
                required
                style={{ WebkitTextSecurity: "disc" } as React.CSSProperties}
                className={`w-full px-5 py-4 text-lg bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${managerPasswordMatchStatus === "mismatch" ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
              />
              {managerPasswordMatchStatus === "mismatch" && (
                <p className="mt-1.5 text-sm font-medium text-destructive">비밀번호가 일치하지 않습니다</p>
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
            setManagerIdStatus("idle");
            setManagerPasswordMatchStatus("idle");
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