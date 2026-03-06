import { type CSSProperties, forwardRef } from "react";

type IconProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "className" | "style"
> & {
  titleAccess?: string;
  fontSize?: "small" | "medium" | "large" | "inherit";
  color?: string;
  style?: CSSProperties;
};

// Maps fontSize prop to CSS class that targets ::before/::after
// Default DSFR icon size is 1.5rem (medium), so no class needed for that
const sizeClasses: Record<string, string> = {
  small: "dsfr-icon--sm",
  large: "dsfr-icon--lg",
};

function createIcon(iconId: string, displayName: string) {
  const Icon = forwardRef<HTMLSpanElement, IconProps>(
    ({ titleAccess, fontSize = "medium", color, style, ...props }, ref) => {
      const sizeClass = sizeClasses[fontSize];
      const className = sizeClass ? `${iconId} ${sizeClass}` : iconId;
      const a11y = titleAccess
        ? { "aria-label": titleAccess, role: "img" as const }
        : { "aria-hidden": true as const };

      return (
        <span
          ref={ref}
          className={className}
          {...a11y}
          style={
            color || style
              ? { ...style, color: color || style?.color }
              : undefined
          }
          {...props}
        />
      );
    }
  );
  Icon.displayName = displayName;
  return Icon;
}

// Actions
export const Add = createIcon("ri-add-line", "Add");
export const AddIcon = Add;
export const Delete = createIcon("ri-delete-bin-line", "Delete");
export const DeleteIcon = Delete;
export const Close = createIcon("ri-close-line", "Close");
export const CloseIcon = Close;
export const Check = createIcon("ri-check-line", "Check");
export const CheckIcon = Check;
export const Clear = createIcon("ri-close-circle-line", "Clear");
export const ClearIcon = Clear;
export const Cancel = createIcon("ri-close-circle-fill", "Cancel");
export const Edit = createIcon("ri-pencil-line", "Edit");
export const EditIcon = Edit;
export const EditNote = createIcon("ri-edit-line", "EditNote");
export const EditNoteIcon = EditNote;
export const Save = createIcon("ri-save-line", "Save");
export const Search = createIcon("ri-search-line", "Search");
export const Send = createIcon("ri-send-plane-line", "Send");
export const SendIcon = Send;
export const Publish = createIcon("ri-upload-2-line", "Publish");
export const PublishIcon = Publish;
export const Download = createIcon("ri-download-line", "Download");
export const Sync = createIcon("ri-refresh-line", "Sync");
export const Done = createIcon("ri-check-line", "Done");
export const DoneIcon = Done;
export const ContentCopy = createIcon("ri-file-copy-line", "ContentCopy");
export const ContentCopyIcon = ContentCopy;
export const ContentPaste = createIcon("ri-clipboard-line", "ContentPaste");

// Navigation / Arrows
export const ExpandMore = createIcon("ri-arrow-down-s-line", "ExpandMore");
export const ExpandMoreIcon = ExpandMore;
export const ChevronRight = createIcon(
  "ri-arrow-right-s-line",
  "ChevronRight"
);
export const ChevronRightIcon = ChevronRight;
export const ChevronLeft = createIcon("ri-arrow-left-s-line", "ChevronLeft");
export const ChevronLeftIcon = ChevronLeft;
export const KeyboardArrowLeft = createIcon(
  "ri-arrow-left-s-line",
  "KeyboardArrowLeft"
);
export const KeyboardArrowLeftIcon = KeyboardArrowLeft;
export const KeyboardArrowRight = createIcon(
  "ri-arrow-right-s-line",
  "KeyboardArrowRight"
);
export const KeyboardArrowRightIcon = KeyboardArrowRight;
export const KeyboardArrowDown = createIcon(
  "ri-arrow-down-s-line",
  "KeyboardArrowDown"
);
export const KeyboardArrowDownIcon = KeyboardArrowDown;
export const KeyboardArrowUp = createIcon(
  "ri-arrow-up-s-line",
  "KeyboardArrowUp"
);
export const KeyboardArrowUpIcon = KeyboardArrowUp;
export const ArrowUpward = createIcon("ri-arrow-up-line", "ArrowUpward");
export const ArrowUpwardIcon = ArrowUpward;
export const ArrowDownward = createIcon("ri-arrow-down-line", "ArrowDownward");
export const ArrowDownwardIcon = ArrowDownward;
export const ArrowDropDown = createIcon(
  "ri-arrow-drop-down-line",
  "ArrowDropDown"
);
export const ArrowDropUp = createIcon("ri-arrow-drop-up-line", "ArrowDropUp");
export const ArrowCircleLeft = createIcon(
  "ri-arrow-left-circle-line",
  "ArrowCircleLeft"
);
export const ArrowCircleRight = createIcon(
  "ri-arrow-right-circle-line",
  "ArrowCircleRight"
);
export const ArrowForwardIosSharp = createIcon(
  "ri-arrow-right-s-line",
  "ArrowForwardIosSharp"
);
export const ArrowForwardIosSharpIcon = ArrowForwardIosSharp;

// Info / Status
export const Info = createIcon("ri-information-fill", "Info");
export const InfoIcon = Info;
export const InfoOutlined = createIcon("ri-information-line", "InfoOutlined");
export const Help = createIcon("ri-question-line", "Help");
export const HelpIcon = Help;
export const ErrorOutline = createIcon(
  "ri-error-warning-line",
  "ErrorOutline"
);
export const ErrorOutlineIcon = ErrorOutline;
export const SyncProblem = createIcon("ri-error-warning-line", "SyncProblem");
export const Timelapse = createIcon("ri-timer-line", "Timelapse");
export const TimerOff = createIcon("ri-timer-flash-line", "TimerOff");
export const HighlightOff = createIcon("ri-close-circle-line", "HighlightOff");
export const Visibility = createIcon("ri-eye-line", "Visibility");
export const VisibilityIcon = Visibility;
export const Description = createIcon("ri-file-text-line", "Description");
export const DescriptionIcon = Description;
export const DoNotDisturb = createIcon("ri-forbid-line", "DoNotDisturb");
export const DoNotDisturbIcon = DoNotDisturb;
export const SentimentVeryDissatisfied = createIcon(
  "ri-emotion-sad-line",
  "SentimentVeryDissatisfied"
);
export const SentimentVeryDissatisfiedIcon = SentimentVeryDissatisfied;
export const CloudDone = createIcon("ri-cloud-line", "CloudDone");
export const CloudDoneIcon = CloudDone;
export const CloudOff = createIcon("ri-cloud-off-line", "CloudOff");
export const CloudOffIcon = CloudOff;
export const TaskAlt = createIcon("ri-checkbox-circle-line", "TaskAlt");
export const TaskAltIcon = TaskAlt;
export const PauseCircleOutline = createIcon(
  "ri-pause-circle-line",
  "PauseCircleOutline"
);
export const PauseCircleOutlineIcon = PauseCircleOutline;
export const CheckCircleOutline = createIcon(
  "ri-checkbox-circle-line",
  "CheckCircleOutline"
);
export const CheckCircleOutlineIcon = CheckCircleOutline;

// UI / Layout
export const Menu = createIcon("ri-menu-line", "Menu");
export const MenuIcon = Menu;
export const MoreVert = createIcon("ri-more-2-fill", "MoreVert");
export const MoreVertIcon = MoreVert;
export const AccountCircle = createIcon(
  "ri-account-circle-line",
  "AccountCircle"
);
export const DragIndicator = createIcon("ri-draggable", "DragIndicator");
export const MapIcon = createIcon("ri-road-map-line", "MapIcon");
export const Link = createIcon("ri-link", "Link");
export const LinkIcon = Link;
export const Forum = createIcon("ri-discuss-line", "Forum");
export const Gavel = createIcon("ri-scales-3-line", "Gavel");
export const GavelIcon = Gavel;
export const CopyButton = ContentCopy;

// Text formatting
export const FormatBold = createIcon("ri-bold", "FormatBold");
export const FormatBoldIcon = FormatBold;
export const FormatItalic = createIcon("ri-italic", "FormatItalic");
export const FormatItalicIcon = FormatItalic;
export const FormatListBulleted = createIcon(
  "ri-list-unordered",
  "FormatListBulleted"
);
export const FormatListBulletedIcon = FormatListBulleted;
export const FormatListNumbered = createIcon(
  "ri-list-ordered",
  "FormatListNumbered"
);
export const FormatListNumberedIcon = FormatListNumbered;
export const AddPhotoAlternate = createIcon(
  "ri-image-add-line",
  "AddPhotoAlternate"
);
export const AddPhotoAlternateIcon = AddPhotoAlternate;
export const GridOn = createIcon("ri-grid-line", "GridOn");
export const GridOnIcon = GridOn;
export const Storage = createIcon("ri-database-2-line", "Storage");
export const StorageIcon = Storage;
