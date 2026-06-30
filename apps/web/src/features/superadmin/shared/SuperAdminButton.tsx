// apps/web/src/features/superadmin/shared/superAdmin-ui/SuperAdminButton.tsx

import type { ButtonHTMLAttributes, JSX, ReactNode } from "react";
import { Link } from "react-router-dom";

type CommonProps = {
  children: ReactNode;
  variant?: "default" | "primary";
  className?: string;
};

type LinkButtonProps = CommonProps & {
  to: string;
};

type NativeButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    to?: undefined;
  };

function buttonClassName(variant: CommonProps["variant"], extra = "") {
  return `ck-superadmin-button ${
    variant === "primary" ? "ck-superadmin-button--primary" : ""
  } ${extra}`.trim();
}

export function SuperAdminButton(
  props: LinkButtonProps | NativeButtonProps,
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
    <button
      {...buttonProps}
      className={buttonClassName(variant, className)}
    >
      {children}
    </button>
  );
}
