import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ToolButton } from "../components/tool-button";
import { useCallback, useRef, useState } from "react";
import { ResponsivePresenter } from "../../components/responsive";
import { LinkPopup } from "../popups/link-popup";
import { useToolbarLocation } from "../stores/toolbar-store";
import { MoreTools } from "../components/more-tools";
import { useRefValue } from "../../hooks/use-ref-value";
import { findMark, selectionToOffset } from "../utils/prosemirror";
import { setTextSelection } from "prosemirror-utils";
import { Flex, Text } from "rebass";
export function LinkSettings(props) {
    const { editor } = props;
    const isBottom = useToolbarLocation() === "bottom";
    if (!editor.isActive("link") || !isBottom)
        return null;
    return (_jsx(MoreTools, Object.assign({}, props, { autoCloseOnUnmount: true, popupId: "linkSettings", tools: ["openLink", "editLink", "removeLink"] })));
}
export function AddLink(props) {
    const { editor } = props;
    const isActive = props.editor.isActive("link");
    const onDone = useCallback((href, text) => {
        var _a;
        if (!href)
            return;
        let commandChain = (_a = editor.current) === null || _a === void 0 ? void 0 : _a.chain().focus();
        if (!commandChain)
            return;
        commandChain
            .extendMarkRange("link")
            .toggleLink({ href, target: "_blank" })
            .insertContent(text || href)
            .focus()
            .unsetMark("link")
            .insertContent(" ")
            .run();
    }, []);
    if (isActive)
        return _jsx(EditLink, Object.assign({}, props));
    return (_jsx(LinkTool, Object.assign({}, props, { onDone: onDone, onClick: () => {
            let { from, to } = editor.state.selection;
            const selectedText = editor.state.doc.textBetween(from, to);
            return { text: selectedText };
        } })));
}
export function EditLink(props) {
    const { editor, selectedNode: _selectedNode } = props;
    const selectedNode = useRefValue(_selectedNode || selectionToOffset(editor.state.selection));
    const onDone = useCallback((href, text) => {
        if (!href || !editor.current)
            return;
        const { from, node, to } = selectedNode.current;
        const mark = findMark(node, "link");
        if (!mark)
            return;
        editor.current
            .chain()
            .command(({ tr }) => {
            tr.removeMark(from, to, mark.type);
            tr.addMark(from, to, mark.type.create({ href }));
            tr.insertText(text || node.textContent, from, to);
            setTextSelection(tr.mapping.map(from))(tr);
            return true;
        })
            .focus(undefined, { scrollIntoView: true })
            .run();
    }, []);
    return (_jsx(LinkTool, Object.assign({}, props, { isEditing: true, onDone: onDone, onClick: () => {
            const { node } = selectedNode.current;
            const selectedText = node.textContent;
            const mark = findMark(node, "link");
            if (!mark)
                return;
            return { text: selectedText, href: mark.attrs.href };
        } })));
}
export function RemoveLink(props) {
    const { editor, selectedNode } = props;
    return (_jsx(ToolButton, Object.assign({}, props, { toggled: false, onClick: () => {
            var _a, _b;
            if (selectedNode)
                (_a = editor.current) === null || _a === void 0 ? void 0 : _a.commands.setTextSelection(selectedNode.from);
            (_b = editor.current) === null || _b === void 0 ? void 0 : _b.chain().focus().unsetLink().run();
        } })));
}
export function OpenLink(props) {
    const { editor, selectedNode } = props;
    const node = (selectedNode === null || selectedNode === void 0 ? void 0 : selectedNode.node) || editor.state.selection.$anchor.node();
    const link = selectedNode ? findMark(node, "link") : null;
    if (!link)
        return null;
    const href = link === null || link === void 0 ? void 0 : link.attrs.href;
    return (_jsxs(Flex, Object.assign({ sx: { alignItems: "center" } }, { children: [_jsx(Text, Object.assign({ as: "a", href: href, target: "_blank", variant: "body", sx: { mr: 1 } }, { children: href })), _jsx(ToolButton, Object.assign({}, props, { toggled: false, onClick: () => window.open(href, "_blank") }))] })));
}
function LinkTool(props) {
    const { isEditing, onClick, onDone } = props;
    const buttonRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [href, setHref] = useState();
    const [text, setText] = useState();
    return (_jsxs(_Fragment, { children: [_jsx(ToolButton, Object.assign({}, props, { buttonRef: buttonRef, onClick: () => {
                    const result = onClick();
                    if (!result)
                        return;
                    const { text, href } = result;
                    setHref(href);
                    setText(text);
                    setIsOpen(true);
                }, toggled: isOpen })), _jsx(ResponsivePresenter, Object.assign({ mobile: "sheet", desktop: "menu", position: {
                    target: buttonRef.current || undefined,
                    isTargetAbsolute: true,
                    location: "below",
                    align: "center",
                    yOffset: 5,
                }, title: isEditing ? "Edit link" : "Insert link", isOpen: isOpen, items: [], onClose: () => setIsOpen(false), focusOnRender: false }, { children: _jsx(LinkPopup, { href: href, text: text, isEditing: isEditing, onClose: () => setIsOpen(false), onDone: ({ href, text }) => {
                        onDone(href, text);
                        setIsOpen(false);
                    } }) }))] }));
}
