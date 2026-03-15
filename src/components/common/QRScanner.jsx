import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QRScanner({ onScan }) {
  const scannerRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    const start = async () => {
      try {
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
          },
          (decodedText) => {
            onScan(decodedText);
          },
        );

        startedRef.current = true;
      } catch (err) {
        console.error("QR start error", err);
      }
    };

    start();

    return async () => {
      try {
        if (scannerRef.current && startedRef.current) {
          await scannerRef.current.stop();
          await scannerRef.current.clear();
          startedRef.current = false;
        }
      } catch (err) {
        console.warn("scanner cleanup skipped");
      }
    };
  }, []);

  return (
    <div className="w-full flex justify-center">
      <div
        id="qr-reader"
        className="w-full max-w-[320px] rounded-xl overflow-hidden"
      />
    </div>
  );
}
