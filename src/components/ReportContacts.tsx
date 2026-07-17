import { Phone, ShieldAlert } from "lucide-react";

interface Contact {
  label: string;
  desc: string;
  number: string;
}

const CONTACTS: Contact[] = [
  { label: "불법 스팸 신고", desc: "한국인터넷진흥원", number: "118" },
  { label: "보이스피싱·금융사기", desc: "금융감독원", number: "1332" },
  { label: "경찰 신고", desc: "긴급·수사 요청", number: "112" },
];

/**
 * 의심 문자를 받았을 때 바로 전화할 수 있는 신고·확인 연락처.
 * 모바일에서는 tel: 링크로 바로 통화가 연결됩니다.
 */
const ReportContacts = () => {
  return (
    <div className="rounded-2xl border border-border/60 bg-white p-5">
      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert className="w-5 h-5 text-primary" />
        <span className="font-bold text-gray-800">의심되면 여기로 신고·확인하세요</span>
      </div>
      <div className="flex flex-col gap-2">
        {CONTACTS.map((c) => (
          <a
            key={c.number}
            href={`tel:${c.number}`}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-gray-50 px-4 py-3 hover:border-primary/40 hover:bg-accent/40 active:scale-[0.99] transition-all"
          >
            <div className="w-10 h-10 rounded-full brand-gradient flex items-center justify-center shrink-0 shadow-sm">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">{c.label}</p>
              <p className="text-xs text-gray-500">{c.desc}</p>
            </div>
            <span className="text-lg font-extrabold text-primary tabular-nums">{c.number}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default ReportContacts;
