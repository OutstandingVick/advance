from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether
)

OUT = "/Users/macbook/Documents/advance/output/pdf/advance-whitepaper.pdf"

BLUE = colors.HexColor("#0033FF")
ORANGE = colors.HexColor("#FD5200")
NAVY = colors.HexColor("#0B1739")
INK = colors.HexColor("#17213A")
MUTED = colors.HexColor("#667085")
LINE = colors.HexColor("#DCE3F0")
PALE = colors.HexColor("#F4F7FC")
WHITE = colors.white

PAGE_W, PAGE_H = A4
MARGIN_X = 20 * mm
MARGIN_TOP = 22 * mm
MARGIN_BOTTOM = 18 * mm

base = getSampleStyleSheet()
styles = {
    "eyebrow": ParagraphStyle("eyebrow", fontName="Helvetica-Bold", fontSize=8.5, leading=11,
                              textColor=BLUE, tracking=1.4, spaceAfter=6),
    "h1": ParagraphStyle("h1", fontName="Helvetica-Bold", fontSize=29, leading=32,
                         textColor=NAVY, spaceAfter=10),
    "h2": ParagraphStyle("h2", fontName="Helvetica-Bold", fontSize=20, leading=24,
                         textColor=NAVY, spaceBefore=4, spaceAfter=9),
    "h3": ParagraphStyle("h3", fontName="Helvetica-Bold", fontSize=11, leading=14,
                         textColor=NAVY, spaceAfter=4),
    "body": ParagraphStyle("body", fontName="Helvetica", fontSize=9.5, leading=14,
                           textColor=INK, spaceAfter=8),
    "small": ParagraphStyle("small", fontName="Helvetica", fontSize=7.8, leading=11,
                            textColor=MUTED),
    "card": ParagraphStyle("card", fontName="Helvetica", fontSize=8.5, leading=12,
                           textColor=INK),
    "white_h": ParagraphStyle("white_h", fontName="Helvetica-Bold", fontSize=23, leading=27,
                              textColor=WHITE),
    "white": ParagraphStyle("white", fontName="Helvetica", fontSize=10, leading=15,
                            textColor=WHITE),
    "quote": ParagraphStyle("quote", fontName="Helvetica-Bold", fontSize=13, leading=17,
                            textColor=BLUE, leftIndent=10, borderColor=BLUE, borderWidth=2,
                            borderPadding=8, spaceAfter=10),
}


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.drawString(MARGIN_X, PAGE_H - 12 * mm, "ADVANCE")
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawRightString(PAGE_W - MARGIN_X, PAGE_H - 12 * mm, "Concise technical whitepaper | September 2026")
    canvas.setStrokeColor(LINE)
    canvas.line(MARGIN_X, PAGE_H - 15 * mm, PAGE_W - MARGIN_X, PAGE_H - 15 * mm)
    canvas.setFillColor(MUTED)
    canvas.drawString(MARGIN_X, 10 * mm, "One verified history. Many independent lenders.")
    canvas.drawRightString(PAGE_W - MARGIN_X, 10 * mm, str(doc.page))
    canvas.restoreState()


doc = BaseDocTemplate(
    OUT, pagesize=A4, rightMargin=MARGIN_X, leftMargin=MARGIN_X,
    topMargin=MARGIN_TOP, bottomMargin=MARGIN_BOTTOM,
    title="Advance - Concise Technical Whitepaper",
    author="Victor P. Ogbonna",
    subject="Portable onchain credit using Creditcoin USC and Attestcoin",
)
frame = Frame(MARGIN_X, MARGIN_BOTTOM, PAGE_W - 2 * MARGIN_X,
              PAGE_H - MARGIN_TOP - MARGIN_BOTTOM, id="main")
doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=header_footer)])


def P(text, style="body"):
    return Paragraph(text, styles[style])


def info_cards(items, widths=None):
    cells = []
    for title, body in items:
        cells.append([P(title, "h3"), P(body, "card")])
    table = Table([cells], colWidths=widths or [(PAGE_W - 2 * MARGIN_X - 8 * mm) / len(cells)] * len(cells),
                  hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.6, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return table


story = []

# Page 1
story += [Spacer(1, 20 * mm), P("TECHNICAL WHITEPAPER", "eyebrow"),
          P("Advance", "h1"),
          P("Portable credit from verified cross-chain repayment evidence.", "quote")]

cover = Table([[
    [P("The idea", "white_h"), Spacer(1, 4 * mm),
     P("Borrowers should build a credit history once, prove it cryptographically, and share it with many lenders under permissions they control.", "white")],
    [P("The mechanism", "white_h"), Spacer(1, 4 * mm),
     P("Creditcoin USC verifies Ethereum repayment events. Advance converts accepted evidence into a reusable score and issues consumer-scoped, expiring score sessions.", "white")]
]], colWidths=[(PAGE_W - 2 * MARGIN_X) / 2] * 2, rowHeights=[56 * mm])
cover.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (0, 0), NAVY),
    ("BACKGROUND", (1, 0), (1, 0), BLUE),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 14),
    ("RIGHTPADDING", (0, 0), (-1, -1), 14),
    ("TOPPADDING", (0, 0), (-1, -1), 15),
]))
story += [cover, Spacer(1, 10 * mm), P("Abstract", "h2"),
          P("Advance is a non-custodial credit-signal registry on Creditcoin. It accepts repayment events only after native Attestcoin verification of their inclusion on a supported source chain. Accepted events update a wallet profile and deterministic score. A wallet can then grant each lender a scoped, time-boxed session over that score. Revoking one grant does not affect another lender, while replayed evidence, expired sessions, stale profile versions, and mismatched consumers fail closed."),
          Spacer(1, 3 * mm),
          info_cards([
              ("Source", "Ethereum Sepolia credit-event transaction"),
              ("Verification", "Creditcoin USC / Attestcoin native verifier"),
              ("Output", "Portable score plus lender-specific sessions"),
          ])]

# Page 2
story += [PageBreak(), Spacer(1, 8 * mm), P("01 / PROBLEM AND DESIGN", "eyebrow"),
          P("Credit history is fragmented by application and chain", "h2"),
          P("Onchain lending decisions often rely on collateral, isolated application records, self-reported claims, or centralized data providers. A borrower who repays on one network cannot easily reuse that history elsewhere. Repeating applications increases friction, while copying raw wallet activity creates privacy and permission risks."),
          P("Advance separates verified facts from lender decisions", "h2"),
          P("The protocol does not approve loans or set a universal interest rate. It establishes a reusable, verifiable credit signal. Independent lenders remain free to interpret the same score and offer different terms."),
          Spacer(1, 2 * mm),
          info_cards([
              ("Verified evidence", "Profile mutations require a successful native USC proof and strict receipt decoding."),
              ("Portable score", "The same versioned wallet profile can be consumed by multiple authorized applications."),
          ]), Spacer(1, 2 * mm),
          info_cards([
              ("Scoped grant", "A grant binds one wallet to one consumer contract and an immutable source scope."),
              ("Time-boxed session", "Every score snapshot expires and is bounded by the underlying grant."),
          ]), Spacer(1, 2 * mm),
          info_cards([
              ("Independent revocation", "The wallet can revoke one lender immediately without disrupting another."),
              ("Replay protection", "A source transaction identity can update the registry only once."),
          ]), Spacer(1, 4 * mm),
          P("System boundaries", "h2"),
          P("Advance holds no user funds, issues no debt, and has no operator-controlled verifier replacement. Anyone may relay proof data, but only correctly verified and decoded source events can change a profile. Public score data is not presented as confidential information; access control governs fresh, consumer-bound score sessions used for consequential actions.")]

# Page 3
story += [PageBreak(), P("02 / USC WORKFLOW", "eyebrow"),
          P("From a Sepolia repayment to a Creditcoin score", "h2"),
          P("Creditcoin Universal Smart Contracts provide the cross-chain verification layer. Advance uses that layer as a core state-transition requirement, not as a decorative attestation."), Spacer(1, 3 * mm)]

flow_data = [
    [P("1", "h3"), P("Source event", "h3"), P("SourceLoanRegistry emits a typed CreditEvent on Ethereum Sepolia.", "card")],
    [P("2", "h3"), P("Proof build", "h3"), P("The worker obtains transaction inclusion and continuity proof data after attestation.", "card")],
    [P("3", "h3"), P("Native verification", "h3"), P("Creditcoin's BlockProver precompile calculates the transaction index and verifyAndEmit must return true.", "card")],
    [P("4", "h3"), P("Strict decode", "h3"), P("Advance requires a successful receipt, the configured emitter, one matching event, and matching action semantics.", "card")],
    [P("5", "h3"), P("Atomic update", "h3"), P("The evidence marker, profile aggregates, score inputs, and profile version commit in one transaction.", "card")],
    [P("6", "h3"), P("Permissioned use", "h3"), P("Each lender requests its own score session and rechecks validity immediately before using it.", "card")],
]
flow = Table(flow_data, colWidths=[10 * mm, 35 * mm, PAGE_W - 2 * MARGIN_X - 45 * mm], hAlign="LEFT")
flow.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (0, -1), BLUE), ("TEXTCOLOR", (0, 0), (0, -1), WHITE),
    ("ROWBACKGROUNDS", (1, 0), (-1, -1), [WHITE, PALE]),
    ("BOX", (0, 0), (-1, -1), 0.6, LINE), ("INNERGRID", (0, 0), (-1, -1), 0.6, LINE),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7),
    ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
]))
story += [flow, Spacer(1, 8 * mm), P("Validity rules", "h2"),
          P("A session is valid only when its grant remains active, its consumer matches, its expiry is in the future, and its captured profile version still matches the wallet's latest profile. New verified evidence invalidates older snapshots. Consumer contracts must call <b>isScoreValid(sessionId, address(this))</b> immediately before any consequential action."),
          P("Score model", "h2"),
          P("The reference score begins at 500 and uses bounded contributions for loan count, repayment count, repayment ratio, and defaults, with a defensive range of 0 to 900. The formula is deterministic and transparent. It is a prototype credit signal, not a complete creditworthiness assessment.")]

# Page 4
story += [PageBreak(), P("03 / IMPLEMENTATION AND STATUS", "eyebrow"),
          P("Testnet deployment", "h2")]

deployment = [
    [P("Component", "h3"), P("Network", "h3"), P("Address / identifier", "h3")],
    [P("Source fixture", "card"), P("Sepolia (11155111)", "card"), P("0x3b52607c3718874f45eF249fB1A92D43f8B3D613", "small")],
    [P("Advance registry", "card"), P("Creditcoin Testnet (102031)", "card"), P("0x3b52607c3718874f45eF249fB1A92D43f8B3D613", "small")],
    [P("Northstar lender", "card"), P("Creditcoin Testnet", "card"), P("0xA760E5f08c62159B6096b0a561D6328439f120E7", "small")],
    [P("Harbor lender", "card"), P("Creditcoin Testnet", "card"), P("0x2304C8cd29e4a9c34539B0E7eE309a39A3658EaC", "small")],
    [P("Native verifier", "card"), P("Creditcoin Testnet", "card"), P("0x0000000000000000000000000000000000000FD2", "small")],
]
dt = Table(deployment, colWidths=[34 * mm, 45 * mm, PAGE_W - 2 * MARGIN_X - 79 * mm], repeatRows=1)
dt.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), NAVY), ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, PALE]),
    ("BOX", (0, 0), (-1, -1), 0.6, LINE), ("INNERGRID", (0, 0), (-1, -1), 0.6, LINE),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
]))
story += [dt, Spacer(1, 7 * mm),
          P("Reference demonstration", "h2"),
          P("One wallet submits verified repayment evidence, producing the same 525 rehearsal score for Northstar Credit and Harbor Lending. Both lenders can hold active sessions with different expiries. Revoking Northstar leaves Harbor valid. Reusing the same evidence is rejected, demonstrating that lender authorization and evidence integrity are separate controls."),
          P("Reusable integration surface", "h2"),
          P("Third-party contracts can vendor <b>IAdvance.sol</b> and <b>AdvanceTypes.sol</b>, call <b>requestScore</b>, and validate the returned session through <b>isScoreValid</b>. The TypeScript package provides typed reads and wallet-owned writes. The reference lenders are examples, not required intermediaries."),
          P("Limitations", "h2"),
          P("A native proof establishes that the configured source contract emitted the event; it does not prove the completeness of a borrower's entire financial history or the offchain economic truth behind that event. The current source fixture records assertions and does not custody or transfer loan assets. Production deployments should add governed source registries, explicit data policies, monitoring, and independent audits."),
          Spacer(1, 4 * mm),
          info_cards([
              ("Live demo", "https://useadvance.vercel.app/demo"),
              ("Repository", "https://github.com/OutstandingVick/advance"),
              ("License", "MIT"),
          ]), Spacer(1, 6 * mm),
          P("Conclusion", "h2"),
          P("Advance demonstrates a narrow but useful primitive: verified cross-chain repayment evidence can become a portable score without surrendering lender choice or wallet-controlled permissions. Creditcoin USC supplies the verification foundation; Advance supplies deterministic scoring, session isolation, revocation, and replay-safe consumption.")]

doc.build(story)
print(OUT)
