import { PersonSimple, ShieldCheck } from "@phosphor-icons/react";

const navItems = [
  { id: "home", label: "身体定位" },
  { id: "office", label: "办公室放松" },
  { id: "library", label: "动作库" },
];

export function SiteHeader({ activeView, onNavigate, onOpenSafety }) {
  return (
    <header className="home-nav">
      <button className="home-brand" type="button" onClick={() => onNavigate("home")} aria-label="MOVE LAB 身体定位首页">
        <span><PersonSimple size={30} weight="fill" /></span>
        <span><strong>MOVE LAB</strong><small>身体放松图鉴</small></span>
      </button>
      <nav aria-label="主要导航">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={activeView === item.id ? "is-active" : ""}
            aria-current={activeView === item.id ? "page" : undefined}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
        <button type="button" onClick={onOpenSafety}>安全说明</button>
      </nav>
      <div className="home-nav__status"><ShieldCheck size={19} weight="fill" />日常动作教育</div>
    </header>
  );
}
