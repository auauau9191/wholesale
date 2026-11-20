import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { wait } from "@/lib/motion/docket-motion";

/**
 * The red ticket: the one action on a screen. Its tab tears off when you press it (you),
 * then `onTorn` runs (navigate, submit, request). Without `onTorn` it behaves as a plain link or button.
 *
 *   <Ticket href="/join" tab="A$60" onTorn={() => navigate({ to: "/join" })}>Join</Ticket>
 *   <Ticket as="button" type="submit" tab="A$60">Continue to payment</Ticket>
 */
const Ticket = forwardRef(function Ticket(
  { as, href, tab, size, wide, onTorn, onClick, className, children, ...rest },
  ref,
) {
  const [torn, setTorn] = useState(false);
  const Tag = as ?? (href ? "a" : "button");

  async function handleClick(event) {
    onClick?.(event);
    if (event.defaultPrevented || !onTorn) return;
    event.preventDefault();
    setTorn(true);
    await wait(380);
    onTorn(event);
    setTimeout(() => setTorn(false), 600);
  }

  return (
    <Tag
      ref={ref}
      href={href}
      type={Tag === "button" && !rest.type ? "button" : rest.type}
      className={cn("dk-ticket", size === "sm" && "dk-ticket--sm", wide && "dk-ticket--wide", torn && "is-torn", className)}
      onClick={handleClick}
      {...rest}
    >
      <span className="dk-ticket__body">{children}</span>
      {tab ? <span className="dk-ticket__tab dk-num">{tab}</span> : null}
    </Tag>
  );
});

export default Ticket;
