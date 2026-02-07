import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Website Policies</h1>
        <p className="text-muted-foreground">Everything you need to know about using Spill The Chai.</p>
      </div>

      <section id="content-policy" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Content Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>Welcome to Spill The Chai! We believe in free expression, but we also value the safety and dignity of our community. To keep this space fun and safe for everyone, the following content is strictly prohibited:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Hate Speech:</strong> Content that promotes violence, incites hatred, or dehumanizes individuals or groups based on race, ethnicity, religion, disability, gender, age, or sexual orientation.</li>
              <li><strong>Harassment & Bullying:</strong> Targeting specific individuals with the intent to harass, shame, or intimidate. Do not use real names to defame or bully others.</li>
              <li><strong>Personal Information (Doxxing):</strong> Sharing private information about others without their consent, including phone numbers, addresses, or private photos.</li>
              <li><strong>Spam:</strong> Repeatedly posting the same content or unauthorized commercial advertisements.</li>
              <li><strong>Explicit Content:</strong> Pornography or sexually explicit images are not allowed.</li>
              <li><strong>Illegal Activities:</strong> Content that promotes or solicits illegal acts.</li>
            </ul>
            <p>We reserve the right to remove any content that violates these guidelines without notice.</p>
          </CardContent>
        </Card>
      </section>

      <section id="user-agreement" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">User Agreement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>By accessing or using Spill The Chai, you agree to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Be at least 13 years of age.</li>
              <li>Be responsible for any content you post, even if posted anonymously.</li>
              <li>Not attempt to bypass security measures or reverse-engineer the platform.</li>
              <li>Respect the community and its moderators.</li>
            </ul>
            <p>We are not responsible for the content posted by users. Opinions expressed in confessions are those of the authors alone.</p>
          </CardContent>
        </Card>
      </section>

      <section id="privacy-policy" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p><strong>Your Anonymity:</strong> We take anonymity seriously. We do not display your username publicly on confessions you post. However, we do store your user ID internally to manage your account and prevent abuse (e.g., rate limiting).</p>
            <p><strong>Data We Collect:</strong></p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Account information (username, encrypted password).</li>
              <li>Content you create (confessions, votes, reports).</li>
              <li>Technical logs (IP addresses) for security and moderation purposes only.</li>
            </ul>
            <p><strong>Data Sharing:</strong> We do not sell your personal data to third parties. We may disclose data only if required by law.</p>
          </CardContent>
        </Card>
      </section>

      <section id="moderator-coc" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Moderator Code of Conduct</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>Moderators are entrusted with maintaining the health of the community. All moderators must adhere to the following:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Fairness:</strong> Act impartially and without bias. Do not target users based on personal disagreements.</li>
              <li><strong>Confidentiality:</strong> Do not share information about reports or reporter identities outside of the moderation team.</li>
              <li><strong>Professionalism:</strong> Respond to reports in a timely manner and uphold the Content Policy consistently.</li>
              <li><strong>Accountability:</strong> Abuse of moderation powers (e.g., deleting content simply because you disagree with it) will result in revocation of privileges.</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
