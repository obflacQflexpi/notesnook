import { ToolbarDefinition, ToolDefinition } from "./types";
import { ToolId } from "./tools";
export declare function getToolDefinition(id: ToolId): ToolDefinition;
export declare function getAllTools(): Record<"fontSize" | "underline" | "bold" | "bulletList" | "code" | "italic" | "subscript" | "superscript" | "fontFamily" | "highlight" | "removeAttachment" | "downloadAttachment" | "deleteColumn" | "deleteRow" | "deleteTable" | "mergeCells" | "ltr" | "rtl" | "strikethrough" | "codeRemove" | "alignCenter" | "alignLeft" | "alignRight" | "alignJustify" | "numberedList" | "textColor" | "openLink" | "linkSettings" | "imageSettings" | "rowProperties" | "insertRowBelow" | "insertRowAbove" | "moveRowDown" | "moveRowUp" | "columnProperties" | "insertColumnRight" | "insertColumnLeft" | "moveColumnRight" | "moveColumnLeft" | "cellProperties" | "cellBorderColor" | "splitCells" | "attachmentSettings" | "embedSettings" | "tableSettings" | "math" | "clearformatting" | "addLink" | "editLink" | "removeLink" | "insertBlock" | "headings" | "imageAlignCenter" | "imageAlignLeft" | "imageAlignRight" | "imageProperties" | "embedAlignCenter" | "embedAlignLeft" | "embedAlignRight" | "embedProperties" | "cellBackgroundColor" | "cellTextColor" | "cellBorderWidth", ToolDefinition>;
export declare const DEFAULT_TOOLS: ToolbarDefinition;
