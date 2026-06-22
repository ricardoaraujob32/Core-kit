// apps/web/src/features/tenant-admin/shared/entity-ui/EntityButton.tsx

import type { ButtonHTMLAttributes, JSX, ReactNode } from "react";
import { Link } from "react-router-dom";

type CommonProps = {
  children: ReactNode;
  variant?: "default" | "primary";
  className?: string;
};

type EntityLinkButtonProps = CommonProps & {
  to: string;
};

type EntityNativeButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    to?: undefined;
  };

function buttonClassName(variant: CommonProps["variant"], className = "") {
  return `ck-entity-button ${
    variant === "primary" ? "ck-entity-button--primary" : ""
  } ${className}`.trim();
}

export function EntityButton(
  props: EntityLinkButtonProps | EntityNativeButtonProps,
): JSX.Element {
  const { children, variant = "default", className = "" } = props;

  if ("to" in props && props.to) {
    return (
      <Link className={buttonClassName(variant, className)} to={props.to}>
        {children}
      </Link>
    );
  }

  const { to: _to, ...buttonProps } = props;

  return (
    <button {...buttonProps} className={buttonClassName(variant, className)}>
      {children}
    </button>
  );
}
