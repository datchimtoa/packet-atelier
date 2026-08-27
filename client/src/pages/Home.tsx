/**
 * Packet Atelier — Xưởng dữ liệu: Swiss-style technical desk, ivory paper,
 * ink-navy structure, and signal-vermilion only for decisive actions.
 */
import { Button } from "@/components/ui/button";
import {
  Braces,
  Check,
  Clipboard,
  Download,
  FileJson2,
  FolderOpen,
  Info,
  LockKeyhole,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ChangeEvent, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const ACCOUNT_FIELDS = [
  "phone_number",
  "cookie",
  "session_token",
  "init_data",
  "wallet",
  "device_id",
  "tg_id",
] as const;

type AccountField = (typeof ACCOUNT_FIELDS)[number];
type AccountRecord = Record<AccountField, string | null>;
type InputMode = "auto" | "json" | "curl";

const DEMO_SOURCE = `curl 'https://example.local/sync' \\
  -H 'cookie: DEMO_COOKIE_A' \\
  -H 'x-atf-tma-session: DEMO_SESSION_A' \\
  --data-raw '{"initData":"DEMO_INIT_A","device_id":"demo-device-a","tg_id":"10001","wallet":"DEMO_WALLET_A"}'

curl 'https://example.local/sync' \\
  -H 'cookie: DEMO_COOKIE_B' \\
  -H 'x-atf-tma-session: DEMO_SESSION_B' \\
  --data-raw '{"initData":"DEMO_INIT_B","device_id":"demo-device-b","tg_id":"10002","wallet":"DEMO_WALLET_B"}'`;

function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <path d="M13 10h29l9 9v35H13z" fill="#FAF6EC" stroke="#16324C" strokeWidth="4" />
      <path d="M42 10v11h11" fill="none" stroke="#E5482D" strokeWidth="4" />
      <path d="M28 22c-6 2-8 6-8 10s2 8 8 10M37 22c6 2 8 6 8 10s-2 8-8 10" fill="none" stroke="#16324C" strokeWidth="4" strokeLinecap="square" />
      <path d="M30 32h5" stroke="#E5482D" strokeWidth="4" strokeLinecap="square" />
    </svg>
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseFirstJson(text: string): unknown {
  for (let start = 0; start < text.length; start += 1) {
    if (text[start] !== "{" && text[start] !== "[") continue;

    const stack: string[] = [];
    let inString = false;
    let escaped = false;

    for (let index = start; index < text.length; index += 1) {
      const character = text[index];
      if (inString) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === '"') inString = false;
        continue;
      }
      if (character === '"') {
        inString = true;
      } else if (character === "{" || character === "[") {
        stack.push(character);
      } else if (character === "}" || character === "]") {
        const open = stack.pop();
        const validPair = (open === "{" && character === "}") || (open === "[" && character === "]");
        if (!validPair) break;
        if (stack.length === 0) return JSON.parse(text.slice(start, index + 1));
      }
    }
  }
  throw new Error("Không tìm thấy một object hoặc mảng JSON hoàn chỉnh trong nội dung.");
}

function parseJsonText(text: string): unknown {
  let cleaned = text.replace(/^\uFEFF/, "").trim();
  if (/^```/.test(cleaned)) {
    cleaned = cleaned.replace(/^```(?:json|jsonc)?\s*/i, "").replace(/\s*```$/, "");
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    return parseFirstJson(cleaned);
  }
}

function findAccounts(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    if (!payload.every(isRecord)) throw new Error("Mỗi phần tử trong mảng phải là một object JSON.");
    return payload;
  }
  if (!isRecord(payload)) throw new Error("Gói JSON phải là một object hoặc mảng JSON.");
  if (ACCOUNT_FIELDS.some((field) => field in payload)) return [payload];

  for (const key of ["accounts", "data", "items", "users"]) {
    const candidate = payload[key];
    if (Array.isArray(candidate) || isRecord(candidate)) {
      try {
        return findAccounts(candidate);
      } catch {
        // Continue searching the remaining common envelopes.
      }
    }
  }
  throw new Error("Không tìm thấy danh sách tài khoản. Hãy dùng mảng JSON hoặc khóa accounts/data/items/users.");
}

function normalizeAccount(source: Record<string, unknown>, phoneNumber?: string): AccountRecord {
  return ACCOUNT_FIELDS.reduce((record, field) => {
    const value = field === "phone_number" && phoneNumber ? phoneNumber : source[field];
    record[field] = value === undefined || value === null || value === "" ? null : String(value);
    return record;
  }, {} as AccountRecord);
}

function splitCurlCommands(text: string): string[] {
  const commands: string[] = [];
  let active: string[] = [];

  for (const line of text.split(/\r?\n/)) {
    if (active.length === 0) {
      const curlAt = line.search(/\bcurl\s+/);
      if (curlAt === -1) continue;
      active = [line.slice(curlAt)];
    } else {
      active.push(line);
    }

    if (!line.trimEnd().endsWith("\\")) {
      commands.push(
        active
          .map((part) => {
            const trimmed = part.trimEnd();
            return trimmed.endsWith("\\") ? trimmed.slice(0, -1) : trimmed;
          })
          .join(" "),
      );
      active = [];
    }
  }

  if (active.length > 0) {
    commands.push(active.map((part) => part.trimEnd().replace(/\\$/, "")).join(" "));
  }
  return commands;
}

function shellTokens(command: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let quote: "'" | '"' | null = null;
  let escaped = false;

  for (const character of command) {
    if (escaped) {
      current += character;
      escaped = false;
      continue;
    }
    if (character === "\\" && quote !== "'") {
      escaped = true;
      continue;
    }
    if (quote) {
      if (character === quote) quote = null;
      else current += character;
      continue;
    }
    if (character === "'" || character === '"') {
      quote = character;
    } else if (/\s/.test(character)) {
      if (current) tokens.push(current);
      current = "";
    } else {
      current += character;
    }
  }
  if (quote) throw new Error("Lệnh curl có dấu nháy chưa đóng.");
  if (current) tokens.push(current);
  return tokens;
}

function optionValue(tokens: string[], options: string[]): string | undefined {
  for (let index = 0; index < tokens.length; index += 1) {
    if (options.includes(tokens[index]) && tokens[index + 1]) return tokens[index + 1];
  }
  return undefined;
}

function curlHeaders(tokens: string[]): Record<string, string> {
  const headers: Record<string, string> = {};
  for (let index = 0; index < tokens.length; index += 1) {
    if (["-H", "--header"].includes(tokens[index]) && tokens[index + 1]) {
      const raw = tokens[index + 1];
      const separator = raw.indexOf(":");
      if (separator !== -1) headers[raw.slice(0, separator).trim().toLowerCase()] = raw.slice(separator + 1).trim();
      index += 1;
    }
  }
  return headers;
}

function accountFromCurl(command: string, phoneNumber?: string): AccountRecord {
  const tokens = shellTokens(command);
  const headers = curlHeaders(tokens);
  const bodyRaw = optionValue(tokens, ["-d", "--data", "--data-raw", "--data-binary"]);
  if (!bodyRaw) throw new Error("Không tìm thấy --data-raw, --data hoặc -d trong lệnh curl.");
  const body = parseJsonText(bodyRaw);
  if (!isRecord(body)) throw new Error("Body của lệnh curl phải là JSON object.");

  return normalizeAccount(
    {
      cookie: headers.cookie,
      session_token: headers["x-atf-tma-session"],
      init_data: body.initData ?? headers["x-telegram-init-data"],
      wallet: body.wallet,
      device_id: body.device_id,
      tg_id: body.tg_id,
    },
    phoneNumber,
  );
}

function maskValue(value: string | null): string | null {
  if (!value) return value;
  if (value.length <= 12) return "••••••";
  return `${value.slice(0, 6)}••••${value.slice(-4)}`;
}

function renderOutput(records: AccountRecord[], reveal: boolean): string {
  const masked = records.map((record) => {
    if (reveal) return record;
    return {
      ...record,
      cookie: maskValue(record.cookie),
      session_token: maskValue(record.session_token),
      init_data: maskValue(record.init_data),
    };
  });
  return JSON.stringify(masked, null, 2);
}

export default function Home() {
  const [source, setSource] = useState("");
  const [mode, setMode] = useState<InputMode>("auto");
  const [targetCount, setTargetCount] = useState(2);
  const [phoneNumbers, setPhoneNumbers] = useState("");
  const [records, setRecords] = useState<AccountRecord[]>([]);
  const [detectedFormat, setDetectedFormat] = useState<"JSON" | "CURL" | null>(null);
  const [message, setMessage] = useState("Dữ liệu chưa được xử lý trong phiên này.");
  const [error, setError] = useState("");
  const [reveal, setReveal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const rawOutput = useMemo(() => renderOutput(records, true), [records]);
  const displayOutput = useMemo(() => renderOutput(records, reveal), [records, reveal]);
  const checksum = useMemo(() => {
    let hash = 5381;
    for (let index = 0; index < rawOutput.length; index += 1) hash = ((hash << 5) + hash) ^ rawOutput.charCodeAt(index);
    return (hash >>> 0).toString(16).toUpperCase().padStart(8, "0");
  }, [rawOutput]);
  const formattedSource = mode === "auto" ? (source.match(/\bcurl\s+/) ? "CURL" : "JSON") : mode.toUpperCase();

  const transform = (nextSource = source) => {
    setError("");
    if (!nextSource.trim()) {
      setRecords([]);
      setDetectedFormat(null);
      setMessage("Dán nội dung hoặc tải tệp để bắt đầu chuyển đổi.");
      return;
    }

    try {
      const selectedPhones = phoneNumbers
        .split(/\r?\n|,/) 
        .map((value) => value.trim())
        .filter(Boolean);
      const useCurl = mode === "curl" || (mode === "auto" && /\bcurl\s+/.test(nextSource));
      const limit = Math.max(1, Math.min(20, Number(targetCount) || 2));
      let normalized: AccountRecord[];

      if (useCurl) {
        const commands = splitCurlCommands(nextSource);
        if (!commands.length) throw new Error("Không tìm thấy lệnh curl trong nội dung đã dán.");
        normalized = commands.slice(0, limit).map((command, index) => accountFromCurl(command, selectedPhones[index]));
        setDetectedFormat("CURL");
      } else {
        const payload = parseJsonText(nextSource);
        normalized = findAccounts(payload).slice(0, limit).map((account, index) => normalizeAccount(account, selectedPhones[index]));
        if (!normalized.length) throw new Error("Không tìm thấy bản ghi nào có thể chuyển đổi.");
        setDetectedFormat("JSON");
      }

      setRecords(normalized);
      setMessage(`Đã chuẩn hóa ${normalized.length} bản ghi trong phiên duyệt này.`);
      toast.success(`Đã tạo ${normalized.length} bản ghi chuẩn hóa.`);
    } catch (caught) {
      const detail = caught instanceof Error ? caught.message : "Không thể đọc nội dung đầu vào.";
      setError(detail);
      setRecords([]);
      setDetectedFormat(null);
      setMessage("Cần kiểm tra lại định dạng đầu vào trước khi xuất kết quả.");
      toast.error("Chưa thể chuyển đổi dữ liệu.");
    }
  };

  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result ?? "");
      setSource(content);
      toast.success(`Đã nạp ${file.name}; nhấn “Chuẩn hóa” để kiểm tra.`);
    };
    reader.onerror = () => toast.error("Không thể đọc tệp này.");
    reader.readAsText(file, "utf-8");
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => handleFile(event.target.files?.[0]);

  const copyOutput = async () => {
    if (!records.length) return;
    try {
      await navigator.clipboard.writeText(rawOutput);
      toast.success("Đã sao chép JSON gốc vào clipboard.");
    } catch {
      toast.error("Trình duyệt không cho phép sao chép tự động. Hãy chọn và sao chép thủ công.");
    }
  };

  const downloadOutput = () => {
    if (!records.length) return;
    const blob = new Blob([rawOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "packet-atelier-output.json";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Đã tạo tệp JSON để tải xuống.");
  };

  const loadExample = () => {
    setSource(DEMO_SOURCE);
    setMode("curl");
    setTargetCount(2);
    setPhoneNumbers("+84000000001\n+84000000002");
    setError("");
    setRecords([]);
    setDetectedFormat(null);
    setMessage("Đã nạp mẫu giả lập. Nhấn “Chuẩn hóa” để xem kết quả.");
  };

  const clearWorkspace = () => {
    setSource("");
    setRecords([]);
    setError("");
    setDetectedFormat(null);
    setMessage("Dữ liệu chưa được xử lý trong phiên này.");
    setPhoneNumbers("");
    if (fileInput.current) fileInput.current.value = "";
  };

  return (
    <div className="atelier-app min-h-screen">
      <aside className="atelier-rail">
        <div className="rail-brand">
          <LogoMark className="brand-mark" />
          <div>
            <p className="eyebrow">XƯỞNG DỮ LIỆU</p>
            <div className="brand-name" aria-label="Packet Atelier">
              <span>PACKET</span>
              <span><i aria-hidden="true">{"{"}</i><strong>A</strong>TELIER<i aria-hidden="true">{"}"}</i></span>
            </div>
          </div>
        </div>

        <div className="rail-rule" />

        <div className="rail-section">
          <p className="eyebrow">PHIÊN LÀM VIỆC</p>
          <div className="rail-status">
            <span className="status-pip" />
            <span>Xử lý tại trình duyệt</span>
          </div>
          <p className="rail-copy">Không có lệnh curl nào được chạy. Nội dung chỉ được đọc trong tab này.</p>
        </div>

        <div className="rail-spacer" />
        <div className="rail-footnote"><span>01</span><span>LOCAL MODE</span></div>
      </aside>

      <main className="atelier-main">
        <header className="topline">
          <div>
            <p className="eyebrow">PACKET ATELIER / 01</p>
            <h1>Dán gói dữ liệu.<br /><em>Xem cấu trúc ngay.</em></h1>
          </div>
          <div className="browser-seal">
            <LogoMark className="mini-mark" />
            <div><strong>LOCAL / BROWSER ONLY</strong><span>Không gửi dữ liệu đi</span></div>
          </div>
        </header>

        <section className="workbench" aria-label="Bàn chuyển đổi dữ liệu">
          <div className="source-panel panel">
            <div className="panel-heading">
              <div className="heading-index">A</div>
              <div>
                <p className="eyebrow">NGUỒN ĐẦU VÀO</p>
                <h2>Nạp gói</h2>
              </div>
              <span className="format-stamp">{formattedSource}</span>
            </div>

            <div className="panel-annotation raw-annotation"><span>RAW CAPTURE</span><span>Giữ nguyên văn bản đầu vào</span><span>01 / 07</span></div>

            <div className="mode-switch" role="group" aria-label="Chọn định dạng đầu vào">
              {(["auto", "json", "curl"] as InputMode[]).map((item) => (
                <button key={item} type="button" onClick={() => setMode(item)} className={mode === item ? "mode-option active" : "mode-option"}>
                  {item === "auto" ? "Tự nhận diện" : item.toUpperCase()}
                </button>
              ))}
            </div>

            <div
              className={isDragging ? "drop-zone is-dragging" : "drop-zone"}
              onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => { event.preventDefault(); setIsDragging(false); handleFile(event.dataTransfer.files[0]); }}
            >
              <div className="source-meta">
                <span><FileJson2 size={15} /> JSON hoặc curl</span>
                <span>{source.length.toLocaleString("vi-VN")} ký tự</span>
              </div>
              <textarea
                value={source}
                onChange={(event) => setSource(event.target.value)}
                placeholder={`Dán JSON, curl nhiều dòng hoặc văn bản có chứa một khối JSON…\n\nVí dụ: curl 'https://example.local/sync' \\\n  -H 'cookie: …' \\\n  --data-raw '{"wallet":"…"}'`}
                spellCheck={false}
                aria-label="Dữ liệu đầu vào"
              />
              <div className="source-actions">
                <Button type="button" variant="ghost" className="quiet-button" onClick={() => fileInput.current?.click()}><FolderOpen size={16} />Tải tệp</Button>
                <input ref={fileInput} className="hidden" type="file" accept=".json,.txt,.curl,text/plain,application/json" onChange={onFileChange} />
                <Button type="button" variant="ghost" className="quiet-button" onClick={loadExample}><Sparkles size={16} />Dùng mẫu giả lập</Button>
              </div>
            </div>

            <div className="source-settings">
              <label className="compact-field">
                <span className="eyebrow">BẢN GHI TỐI ĐA</span>
                <input type="number" min="1" max="20" value={targetCount} onChange={(event) => setTargetCount(Number(event.target.value))} />
              </label>
              <label className="compact-field grow">
                <span className="eyebrow">SỐ ĐIỆN THOẠI <small>— tuỳ chọn, mỗi dòng một bản ghi</small></span>
                <input value={phoneNumbers} onChange={(event) => setPhoneNumbers(event.target.value)} placeholder="+84000000001, +84000000002" />
              </label>
            </div>

            <div className="action-row">
              <Button type="button" className="convert-button" onClick={() => transform()}><Braces size={18} />Chuẩn hóa dữ liệu</Button>
              <Button type="button" variant="ghost" className="reset-button" onClick={clearWorkspace} title="Xóa dữ liệu khỏi phiên hiện tại"><RefreshCcw size={16} />Làm trống</Button>
            </div>
          </div>

          <div className="output-panel panel">
            <div className="panel-heading output-heading">
              <div className="heading-index">B</div>
              <div>
                <p className="eyebrow">BẢN GHI ĐÃ CHUẨN HÓA</p>
                <h2>Kết quả</h2>
              </div>
              {detectedFormat && <span className="verified-stamp"><Check size={13} />{detectedFormat} OK</span>}
            </div>

            <div className="panel-annotation verified-annotation">
              <span><Check size={13} />STRUCTURE CHECK</span>
              <span>{records.length ? `07 FIELDS · CHK ${checksum}` : "AWAITING DATA"}</span>
            </div>

            <div className={error ? "result-status has-error" : records.length ? "result-status is-ready" : "result-status"}>
              {error ? <Info size={17} /> : records.length ? <ShieldCheck size={17} /> : <LockKeyhole size={17} />}
              <span>{error || message}</span>
            </div>

            <div className="output-window">
              <div className="ruler"><span>01</span><span>08</span><span>16</span><span>24</span></div>
              <pre>{records.length ? displayOutput : "[\n  // Bản ghi chuẩn hóa sẽ xuất hiện ở đây\n]"}</pre>
              <div className="output-card-art" aria-hidden="true" />
            </div>

            <div className="output-controls">
              <button type="button" className={reveal ? "reveal-toggle enabled" : "reveal-toggle"} onClick={() => setReveal((current) => !current)}>
                <span className="toggle-dot" />{reveal ? "Đang hiện giá trị dài" : "Đang che giá trị dài"}
              </button>
              <div className="export-buttons">
                <Button type="button" variant="ghost" disabled={!records.length} className="export-button" onClick={copyOutput}><Clipboard size={16} />Sao chép JSON</Button>
                <Button type="button" disabled={!records.length} className="download-button" onClick={downloadOutput}><Download size={16} />Tải tệp</Button>
              </div>
            </div>

            <div className="schema-strip">
              <span className="eyebrow">TRƯỜNG ĐẦU RA</span>
              <div>{ACCOUNT_FIELDS.map((field) => <code key={field}>{field}</code>)}</div>
            </div>
          </div>
        </section>

        <footer><span>PACKET ATELIER</span><span>RUNS IN YOUR BROWSER</span><span>v1.0</span></footer>
      </main>
    </div>
  );
}
