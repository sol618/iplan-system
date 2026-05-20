import { useState } from "react";
import { BookOpen, HelpCircle, X } from "lucide-react";

export function AuthPage ({onLogin}: {onLogin: () => void}) {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<"parent" | "academy">("parent");

  return (
    <div className="size-full flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-12">
          <BookOpen className="w-8 h-8 text-primary" strokeWidth={2} />
          <span className="text-[28px] font-medium text-foreground">아이플랜</span>
        </div>

        {/* User Type Toggle */}
        <div className="flex gap-2 mb-8 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setUserType("parent")}
            className={`flex-1 py-2 rounded-md transition-all ${
              userType === "parent"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            학부모
          </button>
          <button
            onClick={() => setUserType("academy")}
            className={`flex-1 py-2 rounded-md transition-all ${
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

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1>{isLogin ? "로그인" : "회원가입"}</h1>
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
        <p className="text-muted-foreground">
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
                className="text-muted-foreground hover:text-foreground transition-colors"
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
                        학부모님의 이름, 이메일, 전화번호를 입력해주세요.
                        이메일은 로그인 시 사용됩니다.
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
                  문의사항이 있으시면 고객센터 (02-1234-5678) 또는
                  help@iplan.com으로 연락주세요.
                </p>
              </div>

              <button
                onClick={() => setShowHelp(false)}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      <form className="space-y-4" onSubmit={(e)=>{
        e.preventDefault();
        if (isLogin){
            onLogin();
        }
      }}>
        {!isLogin && (
          <div>
            <label htmlFor="name" className="block mb-2 text-foreground">
              이름 <span className="text-destructive">*</span>
            </label>
            <input
              id="name"
              type="text"
              placeholder="홍길동"
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block mb-2 text-foreground">
            이메일 {!isLogin && <span className="text-destructive">*</span>}
          </label>
          <input
            id="email"
            type="email"
            placeholder="parent@example.com"
            className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>

        {!isLogin && (
          <div>
            <label htmlFor="phone" className="block mb-2 text-foreground">
              전화번호 <span className="text-destructive">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="010-1234-5678"
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>
        )}

        {!isLogin && (
          <div className="pt-4 border-t border-border">
            <h3 className="mb-4 text-foreground">학원 및 자녀 정보</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="academyName" className="block mb-2 text-foreground">
                  등록할 학원 이름 <span className="text-destructive">*</span>
                </label>
                <input
                  id="academyName"
                  type="text"
                  placeholder="OO학원"
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>

              <div>
                <label htmlFor="childName" className="block mb-2 text-foreground">
                  자녀 이름 <span className="text-destructive">*</span>
                </label>
                <input
                  id="childName"
                  type="text"
                  placeholder="홍아무개"
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>
            </div>
          </div>
        )}

        <div className={!isLogin ? "pt-4 border-t border-border" : ""}>
          <label htmlFor="password" className="block mb-2 text-foreground">
            비밀번호 {!isLogin && <span className="text-destructive">*</span>}
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>

        {!isLogin && (
          <div>
            <label
              htmlFor="confirmPassword"
              className="block mb-2 text-foreground"
            >
              비밀번호 확인 <span className="text-destructive">*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity mt-6"
        >
          {isLogin ? "로그인" : "회원가입"}
        </button>
      </form>

      <div className="text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-muted-foreground hover:text-foreground transition-colors"
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2">{isAcademyLogin ? "학원 로그인" : "학원 등록"}</h1>
        <p className="text-muted-foreground">
          {isAcademyLogin
            ? "학원 관리자 계정으로 로그인하세요"
            : "학원 정보와 담당자 정보를 입력하세요"}
        </p>
      </div>

      {isAcademyLogin ? (
        <form className="space-y-4"
        onSubmit={(e)=>{
            e.preventDefault();
            if (isAcademyLogin) {
                onLogin();
        }
        }}>
          <div>
            <label htmlFor="academyEmail" className="block mb-2 text-foreground">
              이메일
            </label>
            <input
              id="academyEmail"
              type="email"
              placeholder="academy@example.com"
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="academyPassword"
              className="block mb-2 text-foreground"
            >
              비밀번호
            </label>
            <input
              id="academyPassword"
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity mt-6"
          >
            로그인
          </button>
        </form>
      ) : (
        <form className="space-y-6">
          {/* 학원 정보 섹션 */}
          <div className="space-y-4">
            <h2 className="text-foreground">학원 정보</h2>

            <div>
              <label htmlFor="academyName" className="block mb-2 text-foreground">
                학원명 <span className="text-destructive">*</span>
              </label>
              <input
                id="academyName"
                type="text"
                placeholder="OO학원"
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>

            <div>
              <label htmlFor="academyAddress" className="block mb-2 text-foreground">
                주소 <span className="text-destructive">*</span>
              </label>
              <input
                id="academyAddress"
                type="text"
                placeholder="서울시 강남구 테헤란로 123"
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>

            <div>
              <label htmlFor="academyPhone" className="block mb-2 text-foreground">
                학원 전화번호 <span className="text-destructive">*</span>
              </label>
              <input
                id="academyPhone"
                type="tel"
                placeholder="02-1234-5678"
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>

            <div>
              <label htmlFor="subjects" className="block mb-2 text-foreground">
                교육 과목
              </label>
              <input
                id="subjects"
                type="text"
                placeholder="수학, 영어, 과학"
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>
          </div>

          {/* 등록자 정보 섹션 */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h2 className="text-foreground">등록자 정보</h2>

            <div>
              <label htmlFor="managerName" className="block mb-2 text-foreground">
                담당자 이름 <span className="text-destructive">*</span>
              </label>
              <input
                id="managerName"
                type="text"
                placeholder="홍길동"
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>

            <div>
              <label htmlFor="managerEmail" className="block mb-2 text-foreground">
                이메일 <span className="text-destructive">*</span>
              </label>
              <input
                id="managerEmail"
                type="email"
                placeholder="academy@example.com"
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>

            <div>
              <label htmlFor="managerPhone" className="block mb-2 text-foreground">
                연락처 <span className="text-destructive">*</span>
              </label>
              <input
                id="managerPhone"
                type="tel"
                placeholder="010-1234-5678"
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="managerPassword"
                className="block mb-2 text-foreground"
              >
                비밀번호 <span className="text-destructive">*</span>
              </label>
              <input
                id="managerPassword"
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="managerConfirmPassword"
                className="block mb-2 text-foreground"
              >
                비밀번호 확인 <span className="text-destructive">*</span>
              </label>
              <input
                id="managerConfirmPassword"
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity mt-6"
          >
            학원 등록하기
          </button>
        </form>
      )}

      <div className="text-center">
        <button
          onClick={() => setIsAcademyLogin(!isAcademyLogin)}
          className="text-muted-foreground hover:text-foreground transition-colors"
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
