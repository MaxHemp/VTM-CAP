/* @ds-bundle: {"format":4,"namespace":"VTMDesignSystem_e7f838","components":[{"name":"Breadcrumbs","sourcePath":"components/application/Breadcrumbs.jsx"},{"name":"DataTable","sourcePath":"components/application/DataTable.jsx"},{"name":"Dialog","sourcePath":"components/application/Dialog.jsx"},{"name":"EmptyState","sourcePath":"components/application/EmptyState.jsx"},{"name":"Skeleton","sourcePath":"components/application/Skeleton.jsx"},{"name":"Toast","sourcePath":"components/application/Toast.jsx"},{"name":"WorkflowSteps","sourcePath":"components/application/WorkflowSteps.jsx"},{"name":"BrandRail","sourcePath":"components/core/BrandRail.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Kicker","sourcePath":"components/core/Kicker.jsx"},{"name":"Logo","sourcePath":"components/core/Logo.jsx"},{"name":"Note","sourcePath":"components/core/Note.jsx"},{"name":"SignalLine","sourcePath":"components/core/SignalLine.jsx"},{"name":"StatusBadge","sourcePath":"components/core/StatusBadge.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"BarChart","sourcePath":"components/editorial/BarChart.jsx"},{"name":"Card","sourcePath":"components/editorial/Card.jsx"},{"name":"PullQuote","sourcePath":"components/editorial/PullQuote.jsx"},{"name":"StoryCard","sourcePath":"components/editorial/StoryCard.jsx"},{"name":"CheckboxField","sourcePath":"components/forms/CheckboxField.jsx"},{"name":"TextField","sourcePath":"components/forms/TextField.jsx"}],"sourceHashes":{"components/application/Breadcrumbs.jsx":"9403f06e7263","components/application/DataTable.jsx":"085e04e04539","components/application/Dialog.jsx":"ad0c9fbc3e8c","components/application/EmptyState.jsx":"c19a02ecd0ce","components/application/Skeleton.jsx":"39212c8ba91d","components/application/Toast.jsx":"3c121ae76f95","components/application/WorkflowSteps.jsx":"c2ec8e00b638","components/core/BrandRail.jsx":"3280dcc0447b","components/core/Button.jsx":"6c780fd0c87d","components/core/Kicker.jsx":"c22f408c02a3","components/core/Logo.jsx":"cb483a936a74","components/core/Note.jsx":"d15b9ea4608f","components/core/SignalLine.jsx":"759157db91d5","components/core/StatusBadge.jsx":"e27a7574789f","components/core/Tag.jsx":"deb176247507","components/editorial/BarChart.jsx":"fb5601b119b4","components/editorial/Card.jsx":"e11061b7d6c3","components/editorial/PullQuote.jsx":"955f680a6256","components/editorial/StoryCard.jsx":"b1bb1ae3e962","components/forms/CheckboxField.jsx":"3fcb0eabbe2c","components/forms/TextField.jsx":"f07081e1903c","ui_kits/magazine/Article.jsx":"499742d67405","ui_kits/magazine/Home.jsx":"498aaca99dc6","ui_kits/magazine/Shell.jsx":"1f238b75b9a5"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.VTMDesignSystem_e7f838 = window.VTMDesignSystem_e7f838 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/application/Breadcrumbs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Breadcrumbs({
  items = [],
  label = "Breadcrumb",
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("nav", _extends({
    className: `breadcrumbs ${className}`.trim(),
    "aria-label": label
  }, rest), /*#__PURE__*/React.createElement("ol", null, items.map((it, i) => /*#__PURE__*/React.createElement("li", {
    key: i
  }, i === items.length - 1 ? /*#__PURE__*/React.createElement("span", {
    "aria-current": "page"
  }, it.label) : /*#__PURE__*/React.createElement("a", {
    href: it.href || "#"
  }, it.label)))));
}
Object.assign(__ds_scope, { Breadcrumbs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/application/Breadcrumbs.jsx", error: String((e && e.message) || e) }); }

// components/application/DataTable.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function DataTable({
  caption,
  columns = [],
  rows = [],
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `table-wrap ${className}`.trim()
  }, rest), /*#__PURE__*/React.createElement("table", null, caption ? /*#__PURE__*/React.createElement("caption", null, caption) : null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map((c, i) => /*#__PURE__*/React.createElement("th", {
    scope: "col",
    key: i,
    className: c.num ? "num" : undefined
  }, c.label)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((row, ri) => /*#__PURE__*/React.createElement("tr", {
    key: ri
  }, row.map((cell, ci) => ci === 0 ? /*#__PURE__*/React.createElement("th", {
    scope: "row",
    key: ci
  }, cell) : /*#__PURE__*/React.createElement("td", {
    key: ci,
    className: columns[ci] && columns[ci].num ? "num" : undefined
  }, cell)))))));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/application/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/application/Dialog.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Dialog({
  title,
  actions,
  children,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `dialog-demo ${className}`.trim(),
    role: "group",
    "aria-label": typeof title === "string" ? title : undefined
  }, rest), /*#__PURE__*/React.createElement("h4", null, title), children, actions ? /*#__PURE__*/React.createElement("div", {
    className: "button-row",
    style: {
      marginBottom: 0
    }
  }, actions) : null);
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/application/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/application/EmptyState.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function EmptyState({
  title,
  action,
  children,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `empty-state-demo ${className}`.trim()
  }, rest), /*#__PURE__*/React.createElement("strong", null, title), children, action);
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/application/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/application/Skeleton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Skeleton({
  lines = 3,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `skeleton-demo ${className}`.trim(),
    "aria-hidden": "true"
  }, rest), Array.from({
    length: lines
  }).map((_, i) => /*#__PURE__*/React.createElement("div", {
    className: `skeleton-line${i === lines - 1 ? " skeleton-line-short" : ""}`,
    key: i
  })));
}
Object.assign(__ds_scope, { Skeleton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/application/Skeleton.jsx", error: String((e && e.message) || e) }); }

// components/application/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Toast({
  kind = "good",
  badge,
  children,
  className = "",
  ...rest
}) {
  const mod = kind === "warning" ? " toast-warning" : kind === "error" ? " toast-error" : "";
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `toast-demo${mod} ${className}`.trim(),
    role: "status"
  }, rest), badge ? /*#__PURE__*/React.createElement("span", {
    className: `status status-${kind}`
  }, badge) : null, /*#__PURE__*/React.createElement("span", null, children));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/application/Toast.jsx", error: String((e && e.message) || e) }); }

// components/application/WorkflowSteps.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function WorkflowSteps({
  steps = [],
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("ol", _extends({
    className: `workflow-steps ${className}`.trim()
  }, rest), steps.map((s, i) => {
    const label = typeof s === "string" ? s : s.label;
    const done = typeof s === "object" && s.approved;
    return /*#__PURE__*/React.createElement("li", {
      key: i,
      className: done ? "workflow-approved" : undefined
    }, label);
  }));
}
Object.assign(__ds_scope, { WorkflowSteps });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/application/WorkflowSteps.jsx", error: String((e && e.message) || e) }); }

// components/core/BrandRail.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function BrandRail({
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `brand-rail ${className}`.trim(),
    "aria-hidden": "true"
  }, rest));
}
Object.assign(__ds_scope, { BrandRail });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/BrandRail.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Button({
  variant = "primary",
  type = "button",
  href,
  children,
  className = "",
  ...rest
}) {
  const cls = `button button-${variant} ${className}`.trim();
  if (href) return /*#__PURE__*/React.createElement("a", _extends({
    className: cls,
    href: href
  }, rest), children);
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls,
    type: type
  }, rest), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Kicker.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Kicker({
  as = "kicker",
  children,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("p", _extends({
    className: `${as} ${className}`.trim()
  }, rest), children);
}
Object.assign(__ds_scope, { Kicker });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Kicker.jsx", error: String((e && e.message) || e) }); }

// components/core/Logo.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CDN_COLOR = "https://storage.ghost.io/c/16/79/16794837-6459-4f6f-b4c4-2787d5771849/content/images/size/w1000/2026/04/Logo--2-.png";
const CDN_WHITE = "https://storage.ghost.io/c/16/79/16794837-6459-4f6f-b4c4-2787d5771849/content/images/size/w1000/2026/07/versicherungstech_logo_white.png";
function Logo({
  variant = "color",
  context = "nav",
  height,
  className = "",
  ...rest
}) {
  const src = variant === "white" ? CDN_WHITE : CDN_COLOR;
  const ctx = context === "footer" ? "brand-logo-footer" : context === "nav" ? "brand-logo-nav" : "";
  return /*#__PURE__*/React.createElement("img", _extends({
    className: `brand-logo ${ctx} ${className}`.trim(),
    src: src,
    alt: "VersicherungsTech Magazin",
    decoding: "async",
    referrerPolicy: "no-referrer",
    style: height ? {
      height,
      maxWidth: "none"
    } : undefined,
    "data-asset-id": variant === "white" ? "vtm-logo-white" : "vtm-logo-color",
    "data-media-role": "brand-asset",
    "data-media-status": "approved-brand-asset",
    "data-generation-allowed": "false"
  }, rest));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Logo.jsx", error: String((e && e.message) || e) }); }

// components/core/Note.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Note({
  research = false,
  children,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("aside", _extends({
    className: `note${research ? " note-research" : ""} ${className}`.trim()
  }, rest), children);
}
Object.assign(__ds_scope, { Note });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Note.jsx", error: String((e && e.message) || e) }); }

// components/core/SignalLine.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SignalLine({
  style,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `signal-line ${className}`.trim(),
    "aria-hidden": "true",
    style: style
  }, rest));
}
Object.assign(__ds_scope, { SignalLine });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SignalLine.jsx", error: String((e && e.message) || e) }); }

// components/core/StatusBadge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function StatusBadge({
  kind = "good",
  children,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    className: `status status-${kind} ${className}`.trim()
  }, rest), children);
}
Object.assign(__ds_scope, { StatusBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatusBadge.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tag({
  variant,
  children,
  className = "",
  ...rest
}) {
  const v = variant && variant !== "default" ? ` tag-${variant}` : "";
  return /*#__PURE__*/React.createElement("span", _extends({
    className: `tag${v} ${className}`.trim()
  }, rest), children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/editorial/BarChart.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function BarChart({
  meta,
  title,
  description,
  rows = [],
  source,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("figure", _extends({
    className: `chart-card ${className}`.trim()
  }, rest), /*#__PURE__*/React.createElement("figcaption", null, meta ? /*#__PURE__*/React.createElement("p", {
    className: "meta"
  }, meta) : null, title ? /*#__PURE__*/React.createElement("h3", null, title) : null, description ? /*#__PURE__*/React.createElement("p", {
    className: "lead"
  }, description) : null), /*#__PURE__*/React.createElement("div", {
    className: "chart",
    role: "img",
    "aria-label": rows.map(r => `${r.label} ${r.value} Prozent`).join(", ")
  }, rows.map((r, i) => /*#__PURE__*/React.createElement("div", {
    className: `chart-row${r.research ? " chart-row-research" : ""}`,
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "chart-label"
  }, r.label), /*#__PURE__*/React.createElement("div", {
    className: "bar-track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar-fill",
    style: {
      "--value": `${r.value}%`
    },
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("div", {
    className: "chart-value"
  }, r.value, "\xA0%")))), source ? /*#__PURE__*/React.createElement("p", {
    className: "chart-source"
  }, source) : null);
}
Object.assign(__ds_scope, { BarChart });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/editorial/BarChart.jsx", error: String((e && e.message) || e) }); }

// components/editorial/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Card({
  variant,
  meta,
  title,
  children,
  className = "",
  ...rest
}) {
  const v = variant === "dark" ? " card-dark" : variant === "research" ? " card-research" : "";
  return /*#__PURE__*/React.createElement("article", _extends({
    className: `card${v} ${className}`.trim()
  }, rest), meta ? /*#__PURE__*/React.createElement("p", {
    className: "meta"
  }, meta) : null, title ? /*#__PURE__*/React.createElement("h3", null, title) : null, children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/editorial/Card.jsx", error: String((e && e.message) || e) }); }

// components/editorial/PullQuote.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function PullQuote({
  source,
  children,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `pull-quote ${className}`.trim()
  }, rest), /*#__PURE__*/React.createElement("blockquote", null, children, source ? /*#__PURE__*/React.createElement("footer", null, source) : null));
}
Object.assign(__ds_scope, { PullQuote });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/editorial/PullQuote.jsx", error: String((e && e.message) || e) }); }

// components/editorial/StoryCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function StoryCard({
  index,
  image,
  imageAlt = "",
  tags,
  title,
  href = "#",
  children,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("article", _extends({
    className: `story-card ${className}`.trim()
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "story-visual",
    "aria-hidden": image ? undefined : "true"
  }, image ? /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: imageAlt,
    loading: "lazy"
  }) : null, index ? /*#__PURE__*/React.createElement("span", {
    className: "story-index"
  }, index) : null), /*#__PURE__*/React.createElement("div", {
    className: "story-content"
  }, tags ? /*#__PURE__*/React.createElement("div", {
    className: "tag-row",
    style: {
      marginBlock: "0 1rem"
    }
  }, tags) : null, /*#__PURE__*/React.createElement("h3", null, /*#__PURE__*/React.createElement("a", {
    href: href
  }, title)), children));
}
Object.assign(__ds_scope, { StoryCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/editorial/StoryCard.jsx", error: String((e && e.message) || e) }); }

// components/forms/CheckboxField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function CheckboxField({
  id,
  label,
  checked,
  onChange,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `form-field form-check ${className}`.trim()
  }, rest), /*#__PURE__*/React.createElement("input", {
    id: id,
    name: id,
    type: "checkbox",
    checked: checked,
    onChange: onChange
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: id
  }, label));
}
Object.assign(__ds_scope, { CheckboxField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/CheckboxField.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function TextField({
  id,
  label,
  help,
  error,
  type = "text",
  inputProps = {},
  className = "",
  ...rest
}) {
  const helpId = help ? `${id}-help` : undefined;
  const errId = error ? `${id}-error` : undefined;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `form-field${error ? " form-field-error" : ""} ${className}`.trim()
  }, rest), /*#__PURE__*/React.createElement("label", {
    htmlFor: id
  }, label), /*#__PURE__*/React.createElement("input", _extends({
    id: id,
    name: id,
    type: type,
    "aria-invalid": error ? "true" : undefined,
    "aria-describedby": errId || helpId
  }, inputProps)), error ? /*#__PURE__*/React.createElement("p", {
    className: "field-error-message",
    id: errId
  }, error) : null, help ? /*#__PURE__*/React.createElement("small", {
    id: helpId
  }, help) : null);
}
Object.assign(__ds_scope, { TextField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextField.jsx", error: String((e && e.message) || e) }); }

// ui_kits/magazine/Article.jsx
try { (() => {
const artDS = window.VTMDesignSystem_e7f838;
const {
  Kicker,
  Tag,
  PullQuote,
  Note,
  Button
} = artDS;
function Article({
  onBack
}) {
  return /*#__PURE__*/React.createElement("main", {
    className: "section",
    style: {
      background: "var(--surface-soft)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("article", {
    className: "article-demo"
  }, /*#__PURE__*/React.createElement("aside", {
    className: "article-aside"
  }, /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Inhalts\xFCbersicht"
  }, /*#__PURE__*/React.createElement("p", {
    className: "meta"
  }, "Inhalt"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#a-kontext"
  }, "01 \xB7 Kontext")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#a-abhaengigkeiten"
  }, "02 \xB7 Abh\xE4ngigkeiten")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#a-konsequenz"
  }, "03 \xB7 Konsequenz"))))), /*#__PURE__*/React.createElement("div", {
    className: "article-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tag-row",
    style: {
      marginTop: 0
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    variant: "electric"
  }, "Analyse"), /*#__PURE__*/React.createElement(Tag, null, "Kernsysteme")), /*#__PURE__*/React.createElement("p", {
    className: "meta"
  }, "Architektur / Transformation / VTM Analyse"), /*#__PURE__*/React.createElement("h1", null, "Kernsystemmodernisierung beginnt au\xDFerhalb des Kernsystems"), /*#__PURE__*/React.createElement("p", {
    className: "lead"
  }, "Wer technologische Erneuerung ausschlie\xDFlich als Austausch einer zentralen Plattform versteht, untersch\xE4tzt Daten, Prozesse und organisatorische Abh\xE4ngigkeiten."), /*#__PURE__*/React.createElement("div", {
    className: "article-byline"
  }, /*#__PURE__*/React.createElement("span", null, "Von VTM Redaktion"), /*#__PURE__*/React.createElement("time", {
    dateTime: "2026-07-10"
  }, "10. Juli 2026"), /*#__PURE__*/React.createElement("span", null, "8 Minuten Lesezeit")), /*#__PURE__*/React.createElement("h4", {
    id: "a-kontext"
  }, "Kontext"), /*#__PURE__*/React.createElement("p", null, "Versicherer modernisieren ihre Systemlandschaften nicht auf einer leeren Fl\xE4che. Produktlogik, Vertragsdaten, Bestandsprozesse und regulatorische Anforderungen sind \xFCber Jahre miteinander verwachsen. Eine tragf\xE4hige Strategie muss diese Beziehungen sichtbar machen."), /*#__PURE__*/React.createElement(PullQuote, {
    source: "VTM Analyse \xB7 Kernsystemmodernisierung"
  }, "\u201ENicht der Austausch eines Systems ist das Ziel, sondern die kontrollierte Reduktion kritischer Abh\xE4ngigkeiten.\""), /*#__PURE__*/React.createElement("h4", {
    id: "a-abhaengigkeiten"
  }, "Abh\xE4ngigkeiten"), /*#__PURE__*/React.createElement("p", null, "Datenentkopplung, API-Governance und klare fachliche Verantwortlichkeiten k\xF6nnen die Ver\xE4nderungsf\xE4higkeit bereits verbessern, bevor eine vollst\xE4ndige Plattformmigration beschlossen wird."), /*#__PURE__*/React.createElement("h4", {
    id: "a-konsequenz"
  }, "Konsequenz"), /*#__PURE__*/React.createElement("p", null, "Die entscheidende Frage lautet daher nicht nur, welches Kernsystem k\xFCnftig eingesetzt wird. Entscheidend ist, welche F\xE4higkeiten unabh\xE4ngig vom Kernsystem verf\xFCgbar sein m\xFCssen."), /*#__PURE__*/React.createElement(Note, null, /*#__PURE__*/React.createElement("strong", null, "Quellen & Methodik:"), " Grundlage dieser Beispieldarstellung sind redaktionelle Gespr\xE4che, \xF6ffentlich dokumentierte Architekturans\xE4tze und die Methodik des VTM Modernisierungsindex 2026."), /*#__PURE__*/React.createElement("div", {
    className: "button-row"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: onBack
  }, "Zur\xFCck zur Startseite"))))));
}
Object.assign(window, {
  Article
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/magazine/Article.jsx", error: String((e && e.message) || e) }); }

// ui_kits/magazine/Home.jsx
try { (() => {
const magDS = window.VTMDesignSystem_e7f838;
const {
  Kicker,
  Tag,
  StoryCard,
  BarChart,
  Note,
  Button,
  TextField,
  CheckboxField,
  Toast,
  SignalLine
} = magDS;
function Home({
  onOpenArticle
}) {
  const [email, setEmail] = React.useState("");
  const [consent, setConsent] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState(null);
  const submit = () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Bitte eine gültige geschäftliche E-Mail-Adresse eingeben.");
      setSent(false);
      return;
    }
    if (!consent) {
      setError("Bitte die Datenschutzhinweise bestätigen.");
      setSent(false);
      return;
    }
    setError(null);
    setSent(true);
  };
  return /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement("header", {
    className: "hero"
  }, /*#__PURE__*/React.createElement(HeroAtmosphere, null), /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Kicker, {
    as: "eyebrow"
  }, "Das digitale B2B-Fachmagazin"), /*#__PURE__*/React.createElement("h1", null, "Technologie ", /*#__PURE__*/React.createElement("span", {
    className: "gradient-text"
  }, "verstehen.")), /*#__PURE__*/React.createElement("p", {
    className: "lead"
  }, "Belastbare Einordnung zu Technologie, Regulierung und Transformation \u2013 f\xFCr Entscheiderinnen und Entscheider der Versicherungswirtschaft."), /*#__PURE__*/React.createElement(SignalLine, {
    style: {
      maxWidth: "28rem",
      marginBlock: "2rem"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "button-row"
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: onOpenArticle
  }, "Aktuelle Analyse lesen"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    href: "#briefing"
  }, "Briefing abonnieren"))), /*#__PURE__*/React.createElement("aside", {
    className: "hero-panel"
  }, /*#__PURE__*/React.createElement("p", {
    className: "meta"
  }, "VTM Brand Principles"), /*#__PURE__*/React.createElement("h2", null, "Vier Leitlinien"), /*#__PURE__*/React.createElement("ol", {
    className: "hero-principles"
  }, /*#__PURE__*/React.createElement("li", null, "Inhalt vor Dekoration"), /*#__PURE__*/React.createElement("li", null, "Evidenz vor Behauptung"), /*#__PURE__*/React.createElement("li", null, "Pr\xE4zision vor Effekt"), /*#__PURE__*/React.createElement("li", null, "Zugang vor Exklusivit\xE4t")))))), /*#__PURE__*/React.createElement("section", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "subsection-head"
  }, /*#__PURE__*/React.createElement(Kicker, null, "Aktuell"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "var(--step-3)"
    }
  }, "Formate bleiben vor dem \xD6ffnen erkennbar")), /*#__PURE__*/React.createElement("div", {
    className: "grid-3"
  }, /*#__PURE__*/React.createElement(StoryCard, {
    index: "01 / ANALYSE",
    href: "#",
    onClick: e => {
      e.preventDefault();
      onOpenArticle();
    },
    tags: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Tag, {
      variant: "electric"
    }, "Analyse"), /*#__PURE__*/React.createElement(Tag, null, "8 Min.")),
    title: "Warum Datenentkopplung vor dem Core-Replacement kommt"
  }, /*#__PURE__*/React.createElement("p", null, "Eine Einordnung technologischer Abh\xE4ngigkeiten und realistischer Modernisierungspfade.")), /*#__PURE__*/React.createElement(StoryCard, {
    index: "02 / IT-PRAXIS",
    tags: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Tag, {
      variant: "electric"
    }, "IT-Praxis"), /*#__PURE__*/React.createElement(Tag, null, "Architektur")),
    title: "API-Schichten zwischen \xDCbergangsl\xF6sung und Zielarchitektur"
  }, /*#__PURE__*/React.createElement("p", null, "Welche Integrationsmuster kurzfristig helfen und langfristig neue Abh\xE4ngigkeiten erzeugen k\xF6nnen.")), /*#__PURE__*/React.createElement(StoryCard, {
    index: "03 / RESEARCH",
    tags: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Tag, {
      variant: "brass"
    }, "VTM Research"), /*#__PURE__*/React.createElement(Tag, null, "Index 2026")),
    title: "Modernisierungsindex: Priorit\xE4ten verschieben sich"
  }, /*#__PURE__*/React.createElement("p", null, "Exklusive Daten zu Architektur, Cloud-Betrieb und Erneuerungsstrategien."))))), /*#__PURE__*/React.createElement("section", {
    className: "section section-tint"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "subsection-head"
  }, /*#__PURE__*/React.createElement(Kicker, null, "Data Intelligence"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "var(--step-3)"
    }
  }, "Daten werden erkl\xE4rt, nicht nur dargestellt")), /*#__PURE__*/React.createElement(BarChart, {
    meta: "VTM Modernisierungsindex 2026",
    title: "Priorit\xE4ten bei der Kernsystemmodernisierung",
    description: "Anteil der befragten Unternehmen, die das jeweilige Handlungsfeld als hohe oder sehr hohe Priorit\xE4t einstufen.",
    rows: [{
      label: "Datenentkopplung",
      value: 82
    }, {
      label: "API-Schicht",
      value: 74
    }, {
      label: "Cloud-Betrieb",
      value: 58
    }, {
      label: "Komplettaustausch",
      value: 31,
      research: true
    }],
    source: "Quelle: VTM Modernisierungsindex 2026 \xB7 n = 84 \xB7 Mehrfachnennungen m\xF6glich \xB7 Beispieldaten zur Darstellung des Designsystems."
  }))), /*#__PURE__*/React.createElement("section", {
    className: "section",
    id: "briefing"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap",
    style: {
      maxWidth: "820px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "subsection-head"
  }, /*#__PURE__*/React.createElement(Kicker, null, "Newsletter"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "var(--step-3)"
    }
  }, "VTM Briefing abonnieren"), /*#__PURE__*/React.createElement("p", {
    className: "lead"
  }, "Einordnung zu Versicherungstechnologie, Regulierung und digitaler Transformation.")), /*#__PURE__*/React.createElement("form", {
    className: "form-specimen",
    onSubmit: e => {
      e.preventDefault();
      submit();
    }
  }, /*#__PURE__*/React.createElement(TextField, {
    id: "briefing-email",
    label: "Gesch\xE4ftliche E-Mail-Adresse",
    type: "email",
    inputProps: {
      placeholder: "name@unternehmen.de",
      autoComplete: "email",
      value: email,
      onChange: e => setEmail(e.target.value)
    },
    error: error,
    help: "Designmuster ohne Daten\xFCbertragung. Im Produktivsystem sind Datenschutzhinweis und Double-Opt-in erforderlich."
  }), /*#__PURE__*/React.createElement(CheckboxField, {
    id: "briefing-consent",
    label: "Ich habe die Datenschutzhinweise zur Kenntnis genommen.",
    checked: consent,
    onChange: e => setConsent(e.target.checked)
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    type: "submit"
  }, "Anmeldung pr\xFCfen")), sent ? /*#__PURE__*/React.createElement(Toast, {
    kind: "good",
    badge: "Gepr\xFCft"
  }, "Die Anmeldung w\xE4re im Produktivsystem jetzt zur Best\xE4tigung versendet.") : null), /*#__PURE__*/React.createElement(Note, null, /*#__PURE__*/React.createElement("strong", null, "Hinweis:"), " Alle Inhalte dieser Ansicht sind Beispieldaten aus dem Designsystem."))));
}
Object.assign(window, {
  Home
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/magazine/Home.jsx", error: String((e && e.message) || e) }); }

// ui_kits/magazine/Shell.jsx
try { (() => {
const DS = window.VTMDesignSystem_e7f838;
const {
  Logo,
  BrandRail
} = DS;
function SiteNav({
  view,
  onNavigate
}) {
  return /*#__PURE__*/React.createElement("nav", {
    className: "site-nav",
    "aria-label": "Hauptnavigation"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap-wide nav-inner"
  }, /*#__PURE__*/React.createElement("a", {
    className: "logo-link",
    onClick: () => onNavigate("home"),
    "aria-label": "VersicherungsTech Magazin \u2013 zur Startseite"
  }, /*#__PURE__*/React.createElement(Logo, null)), /*#__PURE__*/React.createElement("ul", {
    className: "nav-links"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    "aria-current": view === "home" ? "true" : undefined,
    onClick: () => onNavigate("home")
  }, "Start")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    "aria-current": view === "article" ? "true" : undefined,
    onClick: () => onNavigate("article")
  }, "Analyse")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    onClick: () => onNavigate("home")
  }, "IT-Praxis")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    onClick: () => onNavigate("home")
  }, "Research")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    onClick: () => onNavigate("home")
  }, "Dossiers")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    onClick: () => onNavigate("home")
  }, "Newsletter")))));
}
function HeroAtmosphere() {
  return /*#__PURE__*/React.createElement("div", {
    className: "hero-atmosphere",
    "aria-hidden": "true",
    "data-media-role": "decorative-atmosphere",
    "data-media-status": "code-native"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hero-orbit hero-orbit-a"
  }), /*#__PURE__*/React.createElement("span", {
    className: "hero-orbit hero-orbit-b"
  }), /*#__PURE__*/React.createElement("span", {
    className: "hero-signal"
  }), /*#__PURE__*/React.createElement("span", {
    className: "hero-node",
    style: {
      top: "32%",
      right: "18%"
    }
  }));
}
function SiteFooter() {
  return /*#__PURE__*/React.createElement("footer", {
    className: "site-footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "footer-grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Logo, {
    variant: "white",
    context: "footer"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: "1.5rem",
      maxWidth: "44ch"
    }
  }, "Digitales B2B-Fachmagazin f\xFCr Technologie, Transformation und Regulierung in der Versicherungswirtschaft.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "meta"
  }, "Rubriken"), /*#__PURE__*/React.createElement("p", null, "Analyse", /*#__PURE__*/React.createElement("br", null), "IT-Praxis", /*#__PURE__*/React.createElement("br", null), "VTM Research", /*#__PURE__*/React.createElement("br", null), "Dossiers")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "meta"
  }, "Leitgedanke"), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", null, "Technologie verstehen.", /*#__PURE__*/React.createElement("br", null), "Versicherung ver\xE4ndern.")))), /*#__PURE__*/React.createElement("div", {
    className: "footer-bottom"
  }, /*#__PURE__*/React.createElement("p", null, "\xA9 2026 VersicherungsTech Magazin"), /*#__PURE__*/React.createElement("p", null, "Beispieldaten \xB7 component-demonstration"))));
}
Object.assign(window, {
  SiteNav,
  HeroAtmosphere,
  SiteFooter
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/magazine/Shell.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Breadcrumbs = __ds_scope.Breadcrumbs;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.Skeleton = __ds_scope.Skeleton;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.WorkflowSteps = __ds_scope.WorkflowSteps;

__ds_ns.BrandRail = __ds_scope.BrandRail;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Kicker = __ds_scope.Kicker;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.Note = __ds_scope.Note;

__ds_ns.SignalLine = __ds_scope.SignalLine;

__ds_ns.StatusBadge = __ds_scope.StatusBadge;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.BarChart = __ds_scope.BarChart;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.PullQuote = __ds_scope.PullQuote;

__ds_ns.StoryCard = __ds_scope.StoryCard;

__ds_ns.CheckboxField = __ds_scope.CheckboxField;

__ds_ns.TextField = __ds_scope.TextField;

})();
