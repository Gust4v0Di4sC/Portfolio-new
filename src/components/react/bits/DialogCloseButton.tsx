import { X } from 'lucide-react';

type DialogCloseButtonProps = {
  label: string;
  onClick: () => void;
};

export default function DialogCloseButton({ label, onClick }: DialogCloseButtonProps) {
  return (
    <button
      className="dialog-close-button ps-control"
      type="button"
      aria-label={label}
      aria-keyshortcuts="O Escape"
      data-shortcut="o"
      data-sound="back"
      onClick={onClick}
    >
      <X aria-hidden="true" size={18} strokeWidth={2.25} />
    </button>
  );
}
