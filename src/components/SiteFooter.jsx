// One footer, reused everywhere (dashboard, sign-in/sign-up, guide) instead
// of each screen rolling its own — keeps the disclaimer/copyright line
// identical and consistently laid out across the app.
export default function SiteFooter() {
  return (
    <footer className="shell-footer">
      <div className="shell-footer-inner">
        <p>Stockproof is a self-research tool, not a source of investment advice — verify figures independently.</p>
        <p className="shell-footer-copyright">&copy; {new Date().getFullYear()} Stockproof. All rights reserved.</p>
      </div>
    </footer>
  );
}
