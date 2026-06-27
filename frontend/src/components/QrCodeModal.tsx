import { useEffect, useRef } from "react";
import { FiDownload, FiX } from "react-icons/fi";

interface QrCodeModalProps {
  grid: boolean[][];
  shortCode: string;
  onClose: () => void;
}

const moduleSize = 10;

const QrCodeModal = ({ grid, shortCode, onClose }: QrCodeModalProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || grid.length === 0) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = grid[0].length * moduleSize;
    canvas.height = grid.length * moduleSize;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#111827";

    grid.forEach((row, rowIndex) => {
      row.forEach((isDark, columnIndex) => {
        if (isDark) {
          context.fillRect(
            columnIndex * moduleSize,
            rowIndex * moduleSize,
            moduleSize,
            moduleSize
          );
        }
      });
    });
  }, [grid]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const downloadQrCode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `${shortCode}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 p-4"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-modal-title"
        className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-5 shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="qr-modal-title" className="text-lg font-semibold text-gray-900">
              QR Code
            </h2>
            <p className="mt-1 break-all text-sm text-gray-500">{shortCode}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close QR code"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="flex justify-center rounded-md border border-gray-200 bg-white p-4">
          <canvas
            ref={canvasRef}
            role="img"
            className="aspect-square w-full max-w-72 [image-rendering:pixelated]"
            aria-label={`QR code for ${shortCode}`}
          />
        </div>

        <button
          type="button"
          onClick={downloadQrCode}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700"
        >
          <FiDownload size={18} />
          Download PNG
        </button>
      </div>
    </div>
  );
};

export default QrCodeModal;
