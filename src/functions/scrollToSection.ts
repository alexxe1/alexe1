export function scrollToSection(
  elementId: string,
  event?: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  pageTitle?: string
) {
  if (event) event.preventDefault();
  if (pageTitle) document.title = pageTitle;
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}
