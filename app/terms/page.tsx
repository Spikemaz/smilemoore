'use client';

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="py-6 px-4 text-center text-white" style={{ backgroundColor: '#1f3a33' }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold">Terms & Conditions</h1>
          <p className="text-lg mt-2" style={{ color: '#cfe8d7' }}>Your Local Research Survey Company – Pre-Opening Giveaway</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-12">
          <p className="text-sm mb-6" style={{ color: '#666' }}>Last updated: 15/11/2025</p>
          <p className="mb-6" style={{ color: '#333' }}>
            <strong>Promoter:</strong> Your Local Research Survey Company, a UK-based trading name ("the Promoter", "we", "our", "us").<br/>
            <strong>Geographical Location:</strong> United Kingdom.
          </p>

          <hr className="my-8" style={{ borderColor: '#cfe8d7' }} />

          {/* Section 1 */}
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1f3a33' }}>1. Introduction</h2>
          <div className="mb-6 space-y-3" style={{ color: '#333' }}>
            <p>1.1 These Terms & Conditions ("Terms") govern participation in the Your Local Research Survey Company Pre-Opening Giveaway ("the Promotion").</p>
            <p>1.2 By entering the Promotion, entrants agree to be bound by these Terms in full.</p>
            <p>1.3 No purchase is necessary to enter or win. Entering the Promotion is completely free and does not require purchasing dental treatment or registering with a dentist.</p>
            <p>1.4 Bonus entries may be awarded for optional actions.</p>
            <p>1.5 The Promoter reserves the right to update, amend, suspend or withdraw the Promotion at any time where reasonably necessary.</p>
            <p>1.6 Participation in the Promotion does not create any contractual, financial, clinical or professional relationship with any dental practice or healthcare provider.</p>
            <p>1.7 The Promoter is a research survey company, not a dental provider, and makes no guarantees relating to clinical services or availability.</p>
          </div>

          <hr className="my-8" style={{ borderColor: '#cfe8d7' }} />

          {/* Section 2 */}
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1f3a33' }}>2. Eligibility</h2>
          <div className="mb-6 space-y-3" style={{ color: '#333' }}>
            <p>2.1 Open to UK residents aged 18 or over.</p>
            <p>2.2 Entrants must live within a reasonable distance of the intended dental practice location (as determined by the Promoter).</p>
            <p>2.3 Only one free entry per person; duplicate or fraudulent entries may be removed.</p>
            <p>2.4 The Promoter may verify eligibility, identity and residency before awarding any prize.</p>
            <p>2.5 Employees, contractors or agents of the Promoter may be excluded at the Promoter's discretion.</p>
            <p>2.6 Automated, bot-generated or manipulated entries may be voided.</p>
          </div>

          <hr className="my-8" style={{ borderColor: '#cfe8d7' }} />

          {/* Section 3 */}
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1f3a33' }}>3. How to Enter</h2>
          <div className="mb-6 space-y-3" style={{ color: '#333' }}>
            <p>3.1 Free Entry Route: Completing the official online registration form provides 1 free entry. The online registration form may include optional or required research questions to help the Promoter identify suitable locations and patient demand. The research survey is part of the entry process and must be completed to receive your free entry.</p>
            <p>3.2 Bonus Entries:</p>
            <ul className="list-disc ml-8 space-y-2">
              <li>+10 entries for each valid referral</li>
              <li>+100 entries for redeeming a £50 Opening Voucher within the first 60 days after the practice opens (if applicable)</li>
            </ul>
            <p>3.3 Bonus entries are optional and not required to enter or win.</p>
            <p>3.4 No purchase or payment is required at any stage.</p>
            <p>3.5 The Promoter may request proof that referrals are genuine.</p>
            <p>3.6 Manipulation, duplication or fraudulent behaviour may result in disqualification.</p>
          </div>

          <hr className="my-8" style={{ borderColor: '#cfe8d7' }} />

          {/* Section 4 */}
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1f3a33' }}>4. Planned Opening & Conditional Nature of the Prize</h2>
          <div className="mb-6 space-y-3" style={{ color: '#333' }}>
            <p>4.1 A new dental practice is intended to open in the local area; however, the opening date, timing, readiness, brand or location cannot be guaranteed.</p>
            <p>4.2 Opening is dependent on factors including but not limited to:</p>
            <ul className="list-disc ml-8 space-y-2">
              <li>CQC registration</li>
              <li>Planning approval</li>
              <li>Landlord consent</li>
              <li>Construction and fit-out timelines</li>
              <li>Regulatory or legal requirements</li>
              <li>Funding availability</li>
            </ul>
            <p>4.3 The Grand Prize is strictly conditional upon the practice opening and becoming operational.</p>
            <p>4.4 The Promoter makes no guarantee that the practice will open.</p>
            <p>4.5 If a practice does open, it may be operated by an entity separate from the Promoter; the Promoter accepts no clinical or operational liability for such an entity.</p>
            <p>4.6 If the practice does not open, the Alternative Prize in Section 7 applies.</p>
          </div>

          <hr className="my-8" style={{ borderColor: '#cfe8d7' }} />

          {/* Section 5 */}
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1f3a33' }}>5. Grand Prize (If the Practice Opens)</h2>
          <div className="mb-6 space-y-3" style={{ color: '#333' }}>
            <p className="font-semibold">If the practice opens, the winner will receive:</p>
            <p className="font-bold text-lg" style={{ color: '#1f3a33' }}>One Year of Dental Care</p>
            <p>Maximum value: £5,000, including:</p>
            <ul className="list-disc ml-8 space-y-2">
              <li>Up to 2 dental check-ups</li>
              <li>Up to 2 hygiene appointments</li>
              <li>Up to 2 emergency consultations</li>
              <li>Preventative advice</li>
              <li>20% discount on general dentistry</li>
              <li>20% discount on Invisalign/orthodontics (subject to clinical suitability)</li>
            </ul>
            <p>5.2 All treatment is subject to full clinical suitability and professional judgment of the dental clinicians.</p>
            <p>5.3 The Grand Prize does not include:</p>
            <ul className="list-disc ml-8 space-y-2">
              <li>Implants</li>
              <li>Oral surgery</li>
              <li>Lab fees</li>
              <li>Specialist dentistry</li>
              <li>Cosmetic treatment</li>
              <li>Any treatment deemed inappropriate or unsafe</li>
            </ul>
            <p>5.4 A strict £5,000 total value cap applies.</p>
            <p>5.5 Appointment availability is subject to capacity and clinical scheduling.</p>
            <p>5.6 No cash alternative or substitution will be offered.</p>
            <p>5.7 The Promoter is not a healthcare provider and holds no clinical liability.</p>
          </div>

          <hr className="my-8" style={{ borderColor: '#cfe8d7' }} />

          {/* Section 6 */}
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1f3a33' }}>6. Voucher Terms</h2>
          <div className="mb-6 space-y-3" style={{ color: '#333' }}>
            <p>6.1 £50 Opening Vouchers are valid only for the first 60 days after the practice officially opens.</p>
            <p>6.2 After 60 days, vouchers expire automatically without extension.</p>
            <p>6.3 Vouchers have no monetary value and cannot be exchanged or transferred.</p>
            <p>6.4 Redeeming a voucher provides +100 bonus entries, but voucher redemption is entirely optional.</p>
            <p className="font-semibold mt-4">6.5 Free Alternative Bonus Entry Clause (Required for Legal Compliance)</p>
            <p>No purchase is necessary to obtain bonus entries. For entrants who do not wish to incur any cost when redeeming the £50 Opening Voucher, a no-cost alternative item or service of equal voucher value will be made available upon request. Redeeming the voucher against either standard services or the no-cost alternative provides the same number of bonus entries (+100). This ensures that no entrant is required to make any payment in order to gain bonus entries or enhance their chances of winning.</p>
          </div>

          <hr className="my-8" style={{ borderColor: '#cfe8d7' }} />

          {/* Section 7 */}
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1f3a33' }}>7. Alternative Prize (If the Practice Does NOT Open)</h2>
          <div className="mb-6 space-y-3" style={{ color: '#333' }}>
            <p>7.1 If the dental practice does not open for any reason, the Grand Prize will not be awarded.</p>
            <p>7.2 Instead, the winner will receive one of the following (chosen by the Promoter):</p>
            <ul className="list-disc ml-8 space-y-2">
              <li>An electric toothbrush, OR</li>
              <li>A £100 Amazon voucher, OR</li>
              <li>A similar promotional item of equivalent value</li>
            </ul>
            <p>7.3 Award of the Alternative Prize fully satisfies the Promoter's obligations.</p>
            <p>7.4 No cash alternative or enhanced substitution will be provided.</p>
          </div>

          <hr className="my-8" style={{ borderColor: '#cfe8d7' }} />

          {/* Section 8 */}
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1f3a33' }}>8. Draw Timing</h2>
          <div className="mb-6 space-y-3" style={{ color: '#333' }}>
            <p>8.1 The prize draw will take place within 14 days of the latest of:</p>
            <ul className="list-disc ml-8 space-y-2">
              <li>90 days after the practice opening date, OR</li>
              <li>The date final CQC registration is granted, OR</li>
              <li>The date the 100th voucher is redeemed</li>
            </ul>
            <p>8.2 If none of these conditions occur (due to non-opening or cancellation), the draw will occur within 14 days of the Promoter confirming the practice will not open.</p>
          </div>

          <hr className="my-8" style={{ borderColor: '#cfe8d7' }} />

          {/* Section 9 */}
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1f3a33' }}>9. Winner Notification</h2>
          <div className="mb-6 space-y-3" style={{ color: '#333' }}>
            <p>9.1 The winner will be notified by email or SMS.</p>
            <p>9.2 If no reply is received within 14 days, a new winner may be selected.</p>
            <p>9.3 Proof of identity and residency may be required.</p>
            <p>9.4 Failure to provide required proof may lead to disqualification.</p>
          </div>

          <hr className="my-8" style={{ borderColor: '#cfe8d7' }} />

          {/* Section 10 */}
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1f3a33' }}>10. Marketing, Photography & Publicity Rights</h2>
          <div className="mb-6 space-y-3" style={{ color: '#333' }}>
            <p>10.1 The winner may be invited to participate in marketing activities including photography, social media content, videos, interviews and testimonials.</p>
            <p>10.2 Participation in marketing is voluntary and requires separate, explicit, written, signed consent.</p>
            <p>10.3 With written consent, the Promoter and the associated dental practice may use the winner's name, image, likeness, video content, testimonial or other materials in marketing across all media.</p>
            <p>10.4 If consent is granted, the winner provides a royalty-free, perpetual, worldwide licence to use such materials.</p>
            <p>10.5 Refusal to participate in marketing does not affect the prize or eligibility.</p>
            <p>10.6 The Promoter may state "a winner has been selected" without identifying the individual.</p>
            <p>10.7 Once marketing materials are published with consent, the Promoter is not obliged to remove them unless legally required.</p>
          </div>

          <hr className="my-8" style={{ borderColor: '#cfe8d7' }} />

          {/* Sections 11-17 */}
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1f3a33' }}>11. Liability, Disclaimers & Limitations</h2>
          <div className="mb-6 space-y-3" style={{ color: '#333' }}>
            <p>11.1 The Promotion is provided on an "as-is" basis.</p>
            <p>11.2 The Promoter is not liable for:</p>
            <ul className="list-disc ml-8 space-y-2">
              <li>Delays or failure of the dental practice to open</li>
              <li>CQC or planning outcomes</li>
              <li>Technical failures</li>
              <li>Lost entries</li>
              <li>Misunderstandings</li>
              <li>Clinical decisions or outcomes</li>
              <li>Location or operational changes</li>
              <li>Any indirect or consequential loss</li>
            </ul>
            <p>11.3 Total liability is limited strictly to the value of the prize awarded.</p>
            <p>11.4 Participants waive any right to claim compensation based on:</p>
            <ul className="list-disc ml-8 space-y-2">
              <li>Changes in opening plans</li>
              <li>Prize substitutions</li>
              <li>Voucher expiry</li>
              <li>Disappointment or expectation</li>
              <li>Clinical refusals</li>
            </ul>
            <p>11.5 The Promoter is not a healthcare provider and has zero clinical liability.</p>
            <p>11.6 Nothing excludes liability for death or personal injury caused by negligence.</p>
          </div>

          <hr className="my-8" style={{ borderColor: '#cfe8d7' }} />

          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1f3a33' }}>12. Fraud & Abuse Prevention</h2>
          <div className="mb-6 space-y-3" style={{ color: '#333' }}>
            <p>12.1 Entries may be cancelled or prizes withdrawn if fraud, manipulation, fake referrals or other abuse is detected.</p>
            <p>12.2 The Promoter may cancel the Promotion if fraudulent activity occurs.</p>
          </div>

          <hr className="my-8" style={{ borderColor: '#cfe8d7' }} />

          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1f3a33' }}>13. Data Protection (GDPR/ICO)</h2>
          <div className="mb-6 space-y-3" style={{ color: '#333' }}>
            <p>13.1 Personal data is used solely for administering the Promotion and providing relevant updates.</p>
            <p>13.2 Entrants may request deletion of their data at any time, removing their entries.</p>
            <p>13.3 Data will never be sold and will only be shared when necessary to operate the Promotion.</p>
          </div>

          <hr className="my-8" style={{ borderColor: '#cfe8d7' }} />

          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1f3a33' }}>14. Force Majeure</h2>
          <div className="mb-6 space-y-3" style={{ color: '#333' }}>
            <p>The Promoter is not responsible for delays or failures caused by events outside its control including: regulatory delays, construction issues, planning refusals, strikes, natural disasters, pandemics or legal changes.</p>
          </div>

          <hr className="my-8" style={{ borderColor: '#cfe8d7' }} />

          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1f3a33' }}>15. Severability</h2>
          <div className="mb-6 space-y-3" style={{ color: '#333' }}>
            <p>If any clause is found invalid or unenforceable, the remainder of the Terms will continue in full force.</p>
          </div>

          <hr className="my-8" style={{ borderColor: '#cfe8d7' }} />

          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1f3a33' }}>16. Governing Law</h2>
          <div className="mb-6 space-y-3" style={{ color: '#333' }}>
            <p>These Terms are governed by the laws of England & Wales. Any disputes will be resolved exclusively in courts of England & Wales.</p>
          </div>

          <hr className="my-8" style={{ borderColor: '#cfe8d7' }} />

          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1f3a33' }}>17. Acceptance</h2>
          <div className="mb-6 space-y-3" style={{ color: '#333' }}>
            <p>By entering, participants confirm they:</p>
            <ul className="list-disc ml-8 space-y-2">
              <li>Fully accept all Terms</li>
              <li>Understand the Grand Prize is conditional upon the practice opening</li>
              <li>Understand vouchers expire after 60 days</li>
              <li>Accept the Alternative Prize if the practice does not open</li>
              <li>Understand clinical decisions are independent of the Promoter</li>
              <li>Acknowledge no entitlement to dental treatment exists</li>
              <li>Waive any right to claim beyond what is expressly stated in these Terms</li>
            </ul>
          </div>

          {/* Back Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => window.location.href = '/home'}
              className="text-white px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105"
              style={{ backgroundColor: '#1f3a33' }}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
