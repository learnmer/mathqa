/* eslint-disable react/prop-types */
import React from 'react';

export function TypographyH1(
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLHeadingElement>,
    HTMLHeadingElement
  >
) {
  return (
    <h1
      {...props}
      className={`scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl ${props.className}`}
    >
      {props.children}
    </h1>
  );
}

export function TypographyH2(
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLHeadingElement>,
    HTMLHeadingElement
  >
) {
  return (
    <h2
      {...props}
      className={`scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 ${props.className}`}
    >
      {props.children}
    </h2>
  );
}

export function TypographyH3(
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLHeadingElement>,
    HTMLHeadingElement
  >
) {
  return (
    <h3
      {...props}
      className={`scroll-m-20 text-2xl font-semibold tracking-tight ${props.className}`}
    >
      {props.children}
    </h3>
  );
}
export function TypographyH4(
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLHeadingElement>,
    HTMLHeadingElement
  >
) {
  return (
    <h4
      {...props}
      className={`scroll-m-20 text-xl font-semibold tracking-tight ${props.className}`}
    >
      {props.children}
    </h4>
  );
}
export function TypographyP(
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLParagraphElement>,
    HTMLParagraphElement
  >
) {
  return (
    <p
      {...props}
      className={`leading-7 [&:not(:first-child)]:mt-6 ${props.className}`}
    >
      {props.children}
    </p>
  );
}
export function TypographyInlineCode(
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  >
) {
  return (
    <code
      {...props}
      className={`relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold ${props.className}`}
    >
      {props.children}
    </code>
  );
}
export function TypographyLead(
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLParagraphElement>,
    HTMLParagraphElement
  >
) {
  return (
    <p
      {...props}
      className={`text-xl text-muted-foreground ${props.className}`}
    >
      {props.children}
    </p>
  );
}
export function TypographyLarge(
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >
) {
  return (
    <div {...props} className={`text-lg font-semibold ${props.className}`}>
      {props.children}
    </div>
  );
}
export function TypographySmall(
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  >
) {
  return (
    <small
      {...props}
      className={`text-sm font-medium leading-none ${props.className}`}
    >
      {props.children}
    </small>
  );
}
export function TypographyMuted(
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLParagraphElement>,
    HTMLParagraphElement
  >
) {
  return (
    <p
      {...props}
      className={`text-sm text-muted-foreground ${props.className}`}
    >
      {props.children}
    </p>
  );
}

