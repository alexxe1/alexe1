export function scrollToSection(
  elementId: string,
  event?: React.MouseEvent<HTMLAnchorElement, MouseEvent>
) {
  if (event) event.preventDefault();
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}
