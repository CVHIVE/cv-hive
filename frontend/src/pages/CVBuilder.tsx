import { useState, useRef, useCallback } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { jsPDF } from 'jspdf';
import { useAuthStore } from '../store/authStore';
import { candidateService } from '../services/candidates';
import toast from 'react-hot-toast';
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Wrench,
  Users,
  FileText,
  ChevronRight,
  ChevronLeft,
  Download,
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Camera,
  Phone,
  Mail,
  MapPin,
  Linkedin,
  Calendar,
  Flag,
  Car,
  Heart,
  CheckCircle,
} from 'lucide-react';

/* ───────────────── Types ───────────────── */
interface PersonalInfo {
  fullName: string;
  nationality: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  visaStatus: string;
  drivingLicense: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  photo: string | null;
}

interface Experience {
  jobTitle: string;
  company: string;
  location: string;
  from: string;
  to: string;
  current: boolean;
  achievements: string[];
}

interface Education {
  degree: string;
  institution: string;
  location: string;
  from: string;
  to: string;
  gpa: string;
  details: string;
}

interface Certification {
  name: string;
  issuer: string;
  date: string;
  expiry: string;
}

interface Language {
  language: string;
  proficiency: 'Native' | 'Fluent' | 'Advanced' | 'Intermediate' | 'Basic';
}

interface SkillCategory {
  category: string;
  skills: string[];
}

interface CVData {
  personal: PersonalInfo;
  summary: string;
  experiences: Experience[];
  educations: Education[];
  certifications: Certification[];
  languages: Language[];
  skillCategories: SkillCategory[];
  references: string;
}

const ACCENT = '#1a5276';
const ACCENT_LIGHT = '#2980b9';
const SIDEBAR_BG = '#1a2332';
const SIDEBAR_TEXT = '#e8ecf1';

const VISA_OPTIONS = [
  'Employment Visa',
  'Own Visa (Freelance)',
  'Golden Visa',
  'Spouse/Family Visa',
  'Visit Visa',
  'Student Visa',
  'Investor Visa',
  'Cancelled Visa',
];

const PROFICIENCY_LEVELS: Language['proficiency'][] = ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Basic'];
const PROFICIENCY_WIDTH: Record<string, number> = { Native: 100, Fluent: 85, Advanced: 70, Intermediate: 50, Basic: 30 };

const STEPS = [
  { label: 'Personal', icon: User },
  { label: 'Summary', icon: FileText },
  { label: 'Experience', icon: Briefcase },
  { label: 'Education', icon: GraduationCap },
  { label: 'Skills', icon: Wrench },
  { label: 'Languages', icon: Globe },
  { label: 'Certs', icon: Award },
  { label: 'References', icon: Users },
];

const emptyExperience = (): Experience => ({
  jobTitle: '', company: '', location: '', from: '', to: '', current: false, achievements: [''],
});
const emptyEducation = (): Education => ({
  degree: '', institution: '', location: '', from: '', to: '', gpa: '', details: '',
});
const emptyCert = (): Certification => ({ name: '', issuer: '', date: '', expiry: '' });
const emptyLang = (): Language => ({ language: '', proficiency: 'Intermediate' });
const emptySkillCat = (): SkillCategory => ({ category: '', skills: [''] });

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function CVBuilder() {
  const { isAuthenticated, user } = useAuthStore();
  const isCandidate = isAuthenticated && user?.role === 'CANDIDATE';

  const [step, setStep] = useState(0);
  const [showPreview, setShowPreview] = useState(true);
  const [uploading, setUploading] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null) as React.MutableRefObject<HTMLInputElement>;

  const [data, setData] = useState<CVData>({
    personal: {
      fullName: '', nationality: '', dateOfBirth: '', gender: '', maritalStatus: '',
      visaStatus: '', drivingLicense: '', email: '', phone: '', location: '', linkedin: '', photo: null,
    },
    summary: '',
    experiences: [emptyExperience()],
    educations: [emptyEducation()],
    certifications: [emptyCert()],
    languages: [emptyLang()],
    skillCategories: [emptySkillCat()],
    references: 'Available upon request',
  });

  /* ── Helpers ── */
  const up = (path: string, value: any) => {
    setData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let obj: any = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = value;
      return copy;
    });
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Photo must be under 2MB'); return; }
    const reader = new FileReader();
    reader.onload = () => up('personal.photo', reader.result as string);
    reader.readAsDataURL(file);
  };

  /* ── PDF Generation ── */
  const generatePDF = useCallback(() => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const W = 210;
    const H = 297;
    const SIDE_W = 70;
    const MAIN_X = SIDE_W + 8;
    const MAIN_W = W - MAIN_X - 10;
    const { personal, summary, experiences, educations, certifications, languages, skillCategories, references } = data;

    const drawSidebar = () => {
      doc.setFillColor(26, 35, 50);
      doc.rect(0, 0, SIDE_W, H, 'F');
    };

    const checkPage = (y: number, need: number) => {
      if (y + need > H - 15) {
        doc.addPage();
        drawSidebar();
        return 20;
      }
      return y;
    };

    // ── Page 1: Sidebar ──
    drawSidebar();

    // Photo
    let sideY = 18;
    if (personal.photo) {
      try {
        doc.addImage(personal.photo, 'JPEG', 15, sideY, 40, 40);
        doc.setDrawColor(41, 128, 185);
        doc.setLineWidth(0.8);
        doc.roundedRect(15, sideY, 40, 40, 3, 3, 'S');
        sideY += 47;
      } catch { sideY += 5; }
    } else {
      sideY += 5;
    }

    // Name on sidebar
    doc.setTextColor(232, 236, 241);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const nameLines = doc.splitTextToSize(personal.fullName || 'Your Name', SIDE_W - 16);
    doc.text(nameLines, SIDE_W / 2, sideY, { align: 'center' });
    sideY += nameLines.length * 7 + 4;

    // Contact section
    const sideSection = (title: string) => {
      sideY += 4;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text(title.toUpperCase(), 8, sideY);
      sideY += 2;
      doc.setDrawColor(41, 128, 185);
      doc.setLineWidth(0.4);
      doc.line(8, sideY, SIDE_W - 8, sideY);
      sideY += 5;
      doc.setTextColor(200, 210, 220);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
    };

    sideSection('Contact');
    const contacts: [string, string][] = [];
    if (personal.email) contacts.push(['Email', personal.email]);
    if (personal.phone) contacts.push(['Phone', personal.phone]);
    if (personal.location) contacts.push(['Location', personal.location]);
    if (personal.linkedin) contacts.push(['LinkedIn', personal.linkedin]);
    for (const [label, val] of contacts) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text(label, 8, sideY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const valLines = doc.splitTextToSize(val, SIDE_W - 16);
      doc.text(valLines, 8, sideY + 4);
      sideY += 4 + valLines.length * 3.8;
    }

    // Personal Details
    sideSection('Personal Details');
    const details: [string, string][] = [];
    if (personal.nationality) details.push(['Nationality', personal.nationality]);
    if (personal.dateOfBirth) details.push(['Date of Birth', personal.dateOfBirth]);
    if (personal.gender) details.push(['Gender', personal.gender]);
    if (personal.maritalStatus) details.push(['Marital Status', personal.maritalStatus]);
    if (personal.visaStatus) details.push(['Visa Status', personal.visaStatus]);
    if (personal.drivingLicense) details.push(['Driving License', personal.drivingLicense]);
    for (const [label, val] of details) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text(label, 8, sideY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(val, 8, sideY + 4);
      sideY += 9;
    }

    // Languages on sidebar
    if (languages.some((l) => l.language)) {
      sideSection('Languages');
      for (const lang of languages.filter((l) => l.language)) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(lang.language, 8, sideY);
        doc.setFontSize(7);
        doc.setTextColor(160, 175, 190);
        doc.text(lang.proficiency, 8, sideY + 4);
        const barW = SIDE_W - 16;
        doc.setFillColor(50, 60, 75);
        doc.roundedRect(8, sideY + 6, barW, 2.5, 1, 1, 'F');
        doc.setFillColor(41, 128, 185);
        const pct = (PROFICIENCY_WIDTH[lang.proficiency] || 50) / 100;
        doc.roundedRect(8, sideY + 6, barW * pct, 2.5, 1, 1, 'F');
        doc.setTextColor(200, 210, 220);
        sideY += 13;
      }
    }

    // Skills on sidebar
    if (skillCategories.some((sc) => sc.skills.some((s) => s.trim()))) {
      sideSection('Skills');
      for (const cat of skillCategories) {
        const filled = cat.skills.filter((s) => s.trim());
        if (!filled.length) continue;
        if (cat.category) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.text(cat.category, 8, sideY);
          sideY += 4;
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        for (const sk of filled) {
          if (sideY > H - 12) break;
          doc.text('\u2022  ' + sk, 8, sideY);
          sideY += 4;
        }
        sideY += 2;
      }
    }

    // ── Main Content ──
    let mainY = 22;

    const mainSection = (title: string) => {
      mainY = checkPage(mainY, 15);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 82, 118);
      doc.text(title.toUpperCase(), MAIN_X, mainY);
      mainY += 2;
      doc.setDrawColor(26, 82, 118);
      doc.setLineWidth(0.6);
      doc.line(MAIN_X, mainY, W - 10, mainY);
      mainY += 6;
      doc.setTextColor(50, 50, 50);
    };

    // Professional Summary
    if (summary.trim()) {
      mainSection('Professional Summary');
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      const sumLines = doc.splitTextToSize(summary, MAIN_W);
      doc.text(sumLines, MAIN_X, mainY);
      mainY += sumLines.length * 4.5 + 6;
    }

    // Experience
    const filledExp = experiences.filter((e) => e.jobTitle || e.company);
    if (filledExp.length) {
      mainSection('Professional Experience');
      for (const exp of filledExp) {
        mainY = checkPage(mainY, 22);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(exp.jobTitle || 'Job Title', MAIN_X, mainY);
        mainY += 5;

        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(41, 128, 185);
        const compLine = [exp.company, exp.location].filter(Boolean).join(' \u2014 ');
        doc.text(compLine || 'Company', MAIN_X, mainY);

        const dateStr = exp.from ? `${exp.from} \u2014 ${exp.current ? 'Present' : exp.to || ''}` : '';
        if (dateStr) {
          doc.setTextColor(120, 120, 120);
          doc.setFontSize(8.5);
          doc.text(dateStr, W - 10, mainY, { align: 'right' });
        }
        mainY += 5;

        doc.setTextColor(60, 60, 60);
        doc.setFontSize(9);
        const achList = exp.achievements.filter((a) => a.trim());
        for (const ach of achList) {
          mainY = checkPage(mainY, 6);
          const achLines = doc.splitTextToSize(ach, MAIN_W - 6);
          doc.text('\u25B8', MAIN_X + 1, mainY);
          doc.text(achLines, MAIN_X + 6, mainY);
          mainY += achLines.length * 4 + 2;
        }
        mainY += 4;
      }
    }

    // Education
    const filledEdu = educations.filter((e) => e.degree || e.institution);
    if (filledEdu.length) {
      mainSection('Education');
      for (const edu of filledEdu) {
        mainY = checkPage(mainY, 16);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(edu.degree || 'Degree', MAIN_X, mainY);
        mainY += 5;

        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(41, 128, 185);
        doc.text([edu.institution, edu.location].filter(Boolean).join(' \u2014 ') || 'Institution', MAIN_X, mainY);

        const dateRange = [edu.from, edu.to].filter(Boolean).join(' \u2014 ');
        if (dateRange) {
          doc.setTextColor(120, 120, 120);
          doc.setFontSize(8.5);
          doc.text(dateRange, W - 10, mainY, { align: 'right' });
        }
        mainY += 5;

        doc.setTextColor(60, 60, 60);
        doc.setFontSize(9);
        if (edu.gpa) {
          doc.text(`GPA: ${edu.gpa}`, MAIN_X, mainY);
          mainY += 4;
        }
        if (edu.details.trim()) {
          const detLines = doc.splitTextToSize(edu.details, MAIN_W);
          doc.text(detLines, MAIN_X, mainY);
          mainY += detLines.length * 4;
        }
        mainY += 5;
      }
    }

    // Certifications
    const filledCerts = certifications.filter((c) => c.name);
    if (filledCerts.length) {
      mainSection('Certifications & Training');
      for (const cert of filledCerts) {
        mainY = checkPage(mainY, 10);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(cert.name, MAIN_X, mainY);
        mainY += 4.5;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        const certMeta = [cert.issuer, cert.date, cert.expiry ? `Expires: ${cert.expiry}` : ''].filter(Boolean).join('  |  ');
        if (certMeta) doc.text(certMeta, MAIN_X, mainY);
        mainY += 6;
      }
    }

    // References
    if (references.trim()) {
      mainSection('References');
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(80, 80, 80);
      const refLines = doc.splitTextToSize(references, MAIN_W);
      doc.text(refLines, MAIN_X, mainY);
    }

    return doc;
  }, [data]);

  /* ── Download & upload ── */
  const handleDownload = () => {
    const doc = generatePDF();
    doc.save(`${data.personal.fullName || 'CV'}-Resume.pdf`);
    toast.success('CV downloaded!');
  };

  const handleUploadToProfile = async () => {
    if (!isCandidate) { toast.error('Log in as a candidate to save to your profile'); return; }
    setUploading(true);
    try {
      const doc = generatePDF();
      const blob = doc.output('blob');
      const file = new File([blob], `${data.personal.fullName || 'CV'}-Resume.pdf`, { type: 'application/pdf' });
      await candidateService.uploadCV(file);
      toast.success('CV saved to your profile!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save CV');
    } finally {
      setUploading(false);
    }
  };

  /* ════════════════════════════════════════
     FORM STEPS
     ════════════════════════════════════════ */
  const p = data.personal;

  const renderStep = () => {
    switch (step) {
      case 0: return <StepPersonal p={p} up={up} photoRef={photoRef} handlePhoto={handlePhoto} />;
      case 1: return <StepSummary summary={data.summary} up={up} />;
      case 2: return <StepExperiences experiences={data.experiences} setData={setData} />;
      case 3: return <StepEducation educations={data.educations} setData={setData} />;
      case 4: return <StepSkills skillCategories={data.skillCategories} setData={setData} />;
      case 5: return <StepLanguages languages={data.languages} setData={setData} />;
      case 6: return <StepCertifications certifications={data.certifications} setData={setData} />;
      case 7: return <StepReferences references={data.references} up={up} />;
      default: return null;
    }
  };

  /* ════════════════════════════════════════
     LIVE PREVIEW
     ════════════════════════════════════════ */
  const renderPreview = () => {
    const { personal: pr, summary: sm, experiences: exps, educations: eds, certifications: certs, languages: langs, skillCategories: scs, references: refs } = data;
    return (
      <div className="bg-white shadow-xl rounded-lg overflow-hidden" style={{ fontSize: '11px', lineHeight: 1.5, maxWidth: 600, margin: '0 auto' }}>
        <div className="flex">
          {/* Sidebar */}
          <div className="w-[38%] min-h-[800px] text-white p-5" style={{ background: SIDEBAR_BG }}>
            {/* Photo */}
            {pr.photo && (
              <div className="mb-4 flex justify-center">
                <img src={pr.photo} alt="" className="w-24 h-24 rounded-md object-cover border-2" style={{ borderColor: ACCENT_LIGHT }} />
              </div>
            )}
            <h2 className="text-center font-bold text-base mb-4 leading-tight" style={{ color: SIDEBAR_TEXT }}>
              {pr.fullName || 'Your Name'}
            </h2>

            {/* Contact */}
            <SidebarSection title="Contact">
              {pr.email && <SidebarItem icon={<Mail size={11} />} text={pr.email} />}
              {pr.phone && <SidebarItem icon={<Phone size={11} />} text={pr.phone} />}
              {pr.location && <SidebarItem icon={<MapPin size={11} />} text={pr.location} />}
              {pr.linkedin && <SidebarItem icon={<Linkedin size={11} />} text={pr.linkedin} />}
            </SidebarSection>

            {/* Personal Details */}
            <SidebarSection title="Personal Details">
              {pr.nationality && <SidebarDetail label="Nationality" value={pr.nationality} />}
              {pr.dateOfBirth && <SidebarDetail label="Date of Birth" value={pr.dateOfBirth} />}
              {pr.gender && <SidebarDetail label="Gender" value={pr.gender} />}
              {pr.maritalStatus && <SidebarDetail label="Marital Status" value={pr.maritalStatus} />}
              {pr.visaStatus && <SidebarDetail label="Visa Status" value={pr.visaStatus} />}
              {pr.drivingLicense && <SidebarDetail label="Driving License" value={pr.drivingLicense} />}
            </SidebarSection>

            {/* Languages */}
            {langs.some((l) => l.language) && (
              <SidebarSection title="Languages">
                {langs.filter((l) => l.language).map((l, i) => (
                  <div key={i} className="mb-2">
                    <div className="flex justify-between text-xs">
                      <span>{l.language}</span>
                      <span className="opacity-70 text-[10px]">{l.proficiency}</span>
                    </div>
                    <div className="w-full rounded-full h-1.5 mt-1" style={{ background: 'rgba(255,255,255,0.15)' }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${PROFICIENCY_WIDTH[l.proficiency] || 50}%`, background: ACCENT_LIGHT }} />
                    </div>
                  </div>
                ))}
              </SidebarSection>
            )}

            {/* Skills */}
            {scs.some((sc) => sc.skills.some((s) => s.trim())) && (
              <SidebarSection title="Skills">
                {scs.map((sc, ci) => (
                  <div key={ci} className="mb-2">
                    {sc.category && <div className="font-semibold text-xs mb-1" style={{ color: ACCENT_LIGHT }}>{sc.category}</div>}
                    <div className="flex flex-wrap gap-1">
                      {sc.skills.filter((s) => s.trim()).map((s, si) => (
                        <span key={si} className="px-1.5 py-0.5 rounded text-[9px]" style={{ background: 'rgba(255,255,255,0.1)' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </SidebarSection>
            )}
          </div>

          {/* Main */}
          <div className="w-[62%] p-5">
            {/* Summary */}
            {sm.trim() && (
              <PreviewSection title="Professional Summary">
                <p className="text-gray-600 text-xs leading-relaxed">{sm}</p>
              </PreviewSection>
            )}

            {/* Experience */}
            {exps.some((e) => e.jobTitle || e.company) && (
              <PreviewSection title="Professional Experience">
                {exps.filter((e) => e.jobTitle || e.company).map((exp, i) => (
                  <div key={i} className="mb-3">
                    <div className="font-bold text-sm text-gray-800">{exp.jobTitle || 'Job Title'}</div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium" style={{ color: ACCENT_LIGHT }}>
                        {[exp.company, exp.location].filter(Boolean).join(' \u2014 ') || 'Company'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {exp.from ? `${exp.from} \u2014 ${exp.current ? 'Present' : exp.to}` : ''}
                      </span>
                    </div>
                    <ul className="mt-1 space-y-0.5">
                      {exp.achievements.filter((a) => a.trim()).map((a, ai) => (
                        <li key={ai} className="text-gray-600 text-xs flex gap-1">
                          <span className="mt-0.5" style={{ color: ACCENT_LIGHT }}>{'\u25B8'}</span> {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </PreviewSection>
            )}

            {/* Education */}
            {eds.some((e) => e.degree || e.institution) && (
              <PreviewSection title="Education">
                {eds.filter((e) => e.degree || e.institution).map((edu, i) => (
                  <div key={i} className="mb-3">
                    <div className="font-bold text-sm text-gray-800">{edu.degree || 'Degree'}</div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium" style={{ color: ACCENT_LIGHT }}>
                        {[edu.institution, edu.location].filter(Boolean).join(' \u2014 ') || 'Institution'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {[edu.from, edu.to].filter(Boolean).join(' \u2014 ')}
                      </span>
                    </div>
                    {edu.gpa && <div className="text-xs text-gray-500 mt-0.5">GPA: {edu.gpa}</div>}
                    {edu.details && <p className="text-xs text-gray-600 mt-0.5">{edu.details}</p>}
                  </div>
                ))}
              </PreviewSection>
            )}

            {/* Certifications */}
            {certs.some((c) => c.name) && (
              <PreviewSection title="Certifications & Training">
                {certs.filter((c) => c.name).map((cert, i) => (
                  <div key={i} className="mb-2">
                    <div className="font-semibold text-xs text-gray-800">{cert.name}</div>
                    <div className="text-[10px] text-gray-400">
                      {[cert.issuer, cert.date, cert.expiry ? `Exp: ${cert.expiry}` : ''].filter(Boolean).join('  \u2022  ')}
                    </div>
                  </div>
                ))}
              </PreviewSection>
            )}

            {/* References */}
            {refs.trim() && (
              <PreviewSection title="References">
                <p className="text-xs text-gray-500 italic">{refs}</p>
              </PreviewSection>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ════════════════════════════════════════
     RENDER
     ════════════════════════════════════════ */
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Professional CV Builder</h1>
          <p className="text-slate-300 text-base">
            Build a UAE-standard CV with a modern template &mdash; ready for Gulf employers
          </p>
        </div>
      </section>

      {/* Step indicator */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center overflow-x-auto py-3 gap-1">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = i === step;
              const done = i < step;
              return (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all
                    ${active ? 'bg-blue-600 text-white shadow' : done ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  {done ? <CheckCircle size={14} /> : <Icon size={14} />}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              );
            })}
            <div className="ml-auto flex gap-2">
              <button onClick={() => setShowPreview(!showPreview)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="Toggle preview">
                {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main area */}
      <section className="flex-1 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-2' : 'max-w-3xl mx-auto'}`}>
            {/* Form Panel */}
            <div>
              <div className="card">{renderStep()}</div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-4">
                <button
                  disabled={step === 0}
                  onClick={() => setStep(step - 1)}
                  className="btn btn-secondary flex items-center gap-1"
                >
                  <ChevronLeft size={16} /> Back
                </button>

                <span className="text-sm text-gray-400">Step {step + 1} of {STEPS.length}</span>

                {step < STEPS.length - 1 ? (
                  <button onClick={() => setStep(step + 1)} className="btn btn-primary flex items-center gap-1">
                    Next <ChevronRight size={16} />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleDownload} className="btn btn-primary flex items-center gap-1">
                      <Download size={16} /> Download PDF
                    </button>
                    {isCandidate && (
                      <button onClick={handleUploadToProfile} disabled={uploading} className="btn btn-secondary flex items-center gap-1">
                        <Save size={16} /> {uploading ? 'Saving\u2026' : 'Save to Profile'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Preview Panel */}
            {showPreview && (
              <div className="hidden lg:block">
                <div className="sticky top-16">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Live Preview</h3>
                    <button onClick={handleDownload} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      <Download size={13} /> Download
                    </button>
                  </div>
                  <div className="overflow-y-auto max-h-[calc(100vh-140px)] rounded-lg border border-gray-200 bg-gray-100 p-3">
                    {renderPreview()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bottom action bar (mobile) */}
      <div className="lg:hidden sticky bottom-0 bg-white border-t p-3 flex gap-2 z-30">
        <button onClick={handleDownload} className="btn btn-primary flex-1 flex items-center justify-center gap-1 text-sm">
          <Download size={16} /> Download PDF
        </button>
        {isCandidate && (
          <button onClick={handleUploadToProfile} disabled={uploading} className="btn btn-secondary flex-1 flex items-center justify-center gap-1 text-sm">
            <Save size={16} /> {uploading ? 'Saving\u2026' : 'Save to Profile'}
          </button>
        )}
      </div>

      <Footer />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   STEP COMPONENTS
   ══════════════════════════════════════════════════════ */

/* ── Step 0: Personal ── */
function StepPersonal({ p, up, photoRef, handlePhoto }: {
  p: PersonalInfo; up: (path: string, val: any) => void;
  photoRef: React.RefObject<HTMLInputElement>; handlePhoto: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <>
      <h2 className="text-lg font-bold mb-1">Personal Information</h2>
      <p className="text-sm text-gray-500 mb-5">UAE employers expect nationality, visa status, and contact details on every CV.</p>

      {/* Photo */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 overflow-hidden bg-gray-50"
          onClick={() => photoRef.current?.click()}
        >
          {p.photo ? (
            <img src={p.photo} alt="" className="w-full h-full object-cover" />
          ) : (
            <Camera size={24} className="text-gray-400" />
          )}
        </div>
        <div>
          <button type="button" onClick={() => photoRef.current?.click()} className="text-sm text-blue-600 hover:underline">
            Upload photo
          </button>
          <p className="text-xs text-gray-400 mt-0.5">Optional &bull; JPG/PNG under 2 MB</p>
          <input ref={photoRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handlePhoto} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Full Name *" icon={<User size={15} />}>
          <input className="input" value={p.fullName} onChange={(e) => up('personal.fullName', e.target.value)} placeholder="Ahmed Al Maktoum" />
        </Field>
        <Field label="Nationality" icon={<Flag size={15} />}>
          <input className="input" value={p.nationality} onChange={(e) => up('personal.nationality', e.target.value)} placeholder="UAE National / Indian / British" />
        </Field>
        <Field label="Date of Birth" icon={<Calendar size={15} />}>
          <input className="input" type="date" value={p.dateOfBirth} onChange={(e) => up('personal.dateOfBirth', e.target.value)} />
        </Field>
        <Field label="Gender">
          <select className="input" value={p.gender} onChange={(e) => up('personal.gender', e.target.value)}>
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </Field>
        <Field label="Marital Status" icon={<Heart size={15} />}>
          <select className="input" value={p.maritalStatus} onChange={(e) => up('personal.maritalStatus', e.target.value)}>
            <option value="">Select</option>
            <option>Single</option>
            <option>Married</option>
            <option>Divorced</option>
            <option>Widowed</option>
          </select>
        </Field>
        <Field label="Visa Status" icon={<FileText size={15} />}>
          <select className="input" value={p.visaStatus} onChange={(e) => up('personal.visaStatus', e.target.value)}>
            <option value="">Select</option>
            {VISA_OPTIONS.map((v) => <option key={v}>{v}</option>)}
          </select>
        </Field>
        <Field label="Driving License" icon={<Car size={15} />}>
          <select className="input" value={p.drivingLicense} onChange={(e) => up('personal.drivingLicense', e.target.value)}>
            <option value="">Select</option>
            <option>UAE Driving License</option>
            <option>International License</option>
            <option>None</option>
          </select>
        </Field>
        <Field label="Email *" icon={<Mail size={15} />}>
          <input className="input" type="email" value={p.email} onChange={(e) => up('personal.email', e.target.value)} placeholder="ahmed@email.com" />
        </Field>
        <Field label="Phone *" icon={<Phone size={15} />}>
          <input className="input" value={p.phone} onChange={(e) => up('personal.phone', e.target.value)} placeholder="+971 50 123 4567" />
        </Field>
        <Field label="Location" icon={<MapPin size={15} />}>
          <input className="input" value={p.location} onChange={(e) => up('personal.location', e.target.value)} placeholder="Dubai, UAE" />
        </Field>
        <Field label="LinkedIn" icon={<Linkedin size={15} />}>
          <input className="input" value={p.linkedin} onChange={(e) => up('personal.linkedin', e.target.value)} placeholder="linkedin.com/in/yourname" />
        </Field>
      </div>
    </>
  );
}

/* ── Step 1: Summary ── */
function StepSummary({ summary, up }: { summary: string; up: (p: string, v: any) => void }) {
  return (
    <>
      <h2 className="text-lg font-bold mb-1">Professional Summary</h2>
      <p className="text-sm text-gray-500 mb-4">Write 3-4 sentences highlighting your experience, key strengths, and career goals. Tailor this for each application.</p>
      <textarea
        className="input min-h-[180px]"
        value={summary}
        onChange={(e) => up('summary', e.target.value)}
        placeholder={`Results-driven marketing professional with 8+ years of experience in the UAE market. Proven track record of increasing brand awareness and driving revenue growth across MENA region. Skilled in digital marketing, team leadership, and strategic planning. Seeking a senior role with a forward-thinking organization in Dubai.`}
      />
      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-700 font-medium mb-1">Tips for UAE CVs:</p>
        <ul className="text-xs text-blue-600 space-y-0.5 list-disc list-inside">
          <li>Mention your total UAE/GCC experience</li>
          <li>Include industry-specific keywords from the job posting</li>
          <li>Keep it concise &mdash; 3 to 5 sentences maximum</li>
          <li>Highlight cross-cultural communication if applicable</li>
        </ul>
      </div>
    </>
  );
}

/* ── Step 2: Experiences ── */
function StepExperiences({ experiences, setData }: { experiences: Experience[]; setData: React.Dispatch<React.SetStateAction<CVData>> }) {
  const update = (idx: number, field: keyof Experience, value: any) => {
    setData((prev) => {
      const copy = [...prev.experiences];
      copy[idx] = { ...copy[idx], [field]: value };
      return { ...prev, experiences: copy };
    });
  };
  const updateAch = (eIdx: number, aIdx: number, val: string) => {
    setData((prev) => {
      const copy = [...prev.experiences];
      const achs = [...copy[eIdx].achievements];
      achs[aIdx] = val;
      copy[eIdx] = { ...copy[eIdx], achievements: achs };
      return { ...prev, experiences: copy };
    });
  };
  const addAch = (eIdx: number) => {
    setData((prev) => {
      const copy = [...prev.experiences];
      copy[eIdx] = { ...copy[eIdx], achievements: [...copy[eIdx].achievements, ''] };
      return { ...prev, experiences: copy };
    });
  };
  const removeAch = (eIdx: number, aIdx: number) => {
    setData((prev) => {
      const copy = [...prev.experiences];
      copy[eIdx] = { ...copy[eIdx], achievements: copy[eIdx].achievements.filter((_, i) => i !== aIdx) };
      return { ...prev, experiences: copy };
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-lg font-bold">Work Experience</h2>
        <button onClick={() => setData((p) => ({ ...p, experiences: [...p.experiences, emptyExperience()] }))} className="btn btn-secondary text-sm flex items-center gap-1">
          <Plus size={14} /> Add Position
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-4">List your most recent role first. Use bullet points for achievements &mdash; start each with an action verb.</p>

      <div className="space-y-6">
        {experiences.map((exp, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-4 relative bg-gray-50/50">
            {experiences.length > 1 && (
              <button onClick={() => setData((p) => ({ ...p, experiences: p.experiences.filter((_, idx) => idx !== i) }))}
                className="absolute top-3 right-3 text-red-400 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Job Title">
                <input className="input" value={exp.jobTitle} onChange={(e) => update(i, 'jobTitle', e.target.value)} placeholder="Senior Marketing Manager" />
              </Field>
              <Field label="Company">
                <input className="input" value={exp.company} onChange={(e) => update(i, 'company', e.target.value)} placeholder="Emirates NBD" />
              </Field>
              <Field label="Location">
                <input className="input" value={exp.location} onChange={(e) => update(i, 'location', e.target.value)} placeholder="Dubai, UAE" />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="From">
                  <input className="input" value={exp.from} onChange={(e) => update(i, 'from', e.target.value)} placeholder="Jan 2020" />
                </Field>
                <Field label="To">
                  <input className="input" value={exp.to} onChange={(e) => update(i, 'to', e.target.value)} placeholder="Present"
                    disabled={exp.current} />
                </Field>
              </div>
            </div>
            <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={exp.current} onChange={(e) => update(i, 'current', e.target.checked)} className="rounded" />
              I currently work here
            </label>

            {/* Achievements */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">Key Achievements / Responsibilities</label>
                <button onClick={() => addAch(i)} className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"><Plus size={12} /> Add bullet</button>
              </div>
              <div className="space-y-2">
                {exp.achievements.map((ach, ai) => (
                  <div key={ai} className="flex gap-2">
                    <span className="mt-2 text-gray-400 text-sm">{'\u25B8'}</span>
                    <input className="input flex-1 text-sm" value={ach} onChange={(e) => updateAch(i, ai, e.target.value)}
                      placeholder="Increased revenue by 35% through strategic digital campaigns across MENA" />
                    {exp.achievements.length > 1 && (
                      <button onClick={() => removeAch(i, ai)} className="text-red-400 hover:text-red-600 mt-1"><Trash2 size={14} /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── Step 3: Education ── */
function StepEducation({ educations, setData }: { educations: Education[]; setData: React.Dispatch<React.SetStateAction<CVData>> }) {
  const update = (idx: number, field: keyof Education, value: string) => {
    setData((prev) => {
      const copy = [...prev.educations];
      copy[idx] = { ...copy[idx], [field]: value };
      return { ...prev, educations: copy };
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-lg font-bold">Education</h2>
        <button onClick={() => setData((p) => ({ ...p, educations: [...p.educations, emptyEducation()] }))} className="btn btn-secondary text-sm flex items-center gap-1">
          <Plus size={14} /> Add Education
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-4">Include your highest qualification first. UAE employers value accredited international degrees.</p>

      <div className="space-y-5">
        {educations.map((edu, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-4 relative bg-gray-50/50">
            {educations.length > 1 && (
              <button onClick={() => setData((p) => ({ ...p, educations: p.educations.filter((_, idx) => idx !== i) }))}
                className="absolute top-3 right-3 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Degree / Qualification">
                <input className="input" value={edu.degree} onChange={(e) => update(i, 'degree', e.target.value)} placeholder="Bachelor of Business Administration" />
              </Field>
              <Field label="Institution">
                <input className="input" value={edu.institution} onChange={(e) => update(i, 'institution', e.target.value)} placeholder="American University of Sharjah" />
              </Field>
              <Field label="Location">
                <input className="input" value={edu.location} onChange={(e) => update(i, 'location', e.target.value)} placeholder="Sharjah, UAE" />
              </Field>
              <Field label="GPA (optional)">
                <input className="input" value={edu.gpa} onChange={(e) => update(i, 'gpa', e.target.value)} placeholder="3.8 / 4.0" />
              </Field>
              <Field label="From">
                <input className="input" value={edu.from} onChange={(e) => update(i, 'from', e.target.value)} placeholder="Sep 2016" />
              </Field>
              <Field label="To">
                <input className="input" value={edu.to} onChange={(e) => update(i, 'to', e.target.value)} placeholder="Jun 2020" />
              </Field>
            </div>
            <div className="mt-3">
              <Field label="Additional Details (optional)">
                <textarea className="input min-h-[60px] text-sm" value={edu.details} onChange={(e) => update(i, 'details', e.target.value)}
                  placeholder="Relevant coursework, honors, thesis topic, extracurricular activities..." />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── Step 4: Skills ── */
function StepSkills({ skillCategories, setData }: { skillCategories: SkillCategory[]; setData: React.Dispatch<React.SetStateAction<CVData>> }) {
  const updateCat = (idx: number, val: string) => {
    setData((prev) => {
      const copy = [...prev.skillCategories];
      copy[idx] = { ...copy[idx], category: val };
      return { ...prev, skillCategories: copy };
    });
  };
  const updateSkill = (catIdx: number, skillIdx: number, val: string) => {
    setData((prev) => {
      const copy = [...prev.skillCategories];
      const skills = [...copy[catIdx].skills];
      skills[skillIdx] = val;
      copy[catIdx] = { ...copy[catIdx], skills };
      return { ...prev, skillCategories: copy };
    });
  };
  const addSkill = (catIdx: number) => {
    setData((prev) => {
      const copy = [...prev.skillCategories];
      copy[catIdx] = { ...copy[catIdx], skills: [...copy[catIdx].skills, ''] };
      return { ...prev, skillCategories: copy };
    });
  };
  const removeSkill = (catIdx: number, skillIdx: number) => {
    setData((prev) => {
      const copy = [...prev.skillCategories];
      copy[catIdx] = { ...copy[catIdx], skills: copy[catIdx].skills.filter((_, i) => i !== skillIdx) };
      return { ...prev, skillCategories: copy };
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-lg font-bold">Skills</h2>
        <button onClick={() => setData((p) => ({ ...p, skillCategories: [...p.skillCategories, emptySkillCat()] }))} className="btn btn-secondary text-sm flex items-center gap-1">
          <Plus size={14} /> Add Category
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-4">Group your skills by category (e.g., Technical, Software, Soft Skills). This helps ATS systems and recruiters scan quickly.</p>

      <div className="space-y-5">
        {skillCategories.map((cat, ci) => (
          <div key={ci} className="border border-gray-200 rounded-xl p-4 relative bg-gray-50/50">
            {skillCategories.length > 1 && (
              <button onClick={() => setData((p) => ({ ...p, skillCategories: p.skillCategories.filter((_, i) => i !== ci) }))}
                className="absolute top-3 right-3 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
            )}
            <Field label="Category Name">
              <input className="input" value={cat.category} onChange={(e) => updateCat(ci, e.target.value)} placeholder="Technical Skills" />
            </Field>
            <div className="mt-3 space-y-2">
              {cat.skills.map((sk, si) => (
                <div key={si} className="flex gap-2">
                  <input className="input flex-1 text-sm" value={sk} onChange={(e) => updateSkill(ci, si, e.target.value)}
                    placeholder="e.g. React.js, Python, SAP, AutoCAD..." />
                  {cat.skills.length > 1 && (
                    <button onClick={() => removeSkill(ci, si)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                  )}
                </div>
              ))}
              <button onClick={() => addSkill(ci)} className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                <Plus size={12} /> Add skill
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── Step 5: Languages ── */
function StepLanguages({ languages, setData }: { languages: Language[]; setData: React.Dispatch<React.SetStateAction<CVData>> }) {
  const update = (idx: number, field: keyof Language, value: string) => {
    setData((prev) => {
      const copy = [...prev.languages];
      copy[idx] = { ...copy[idx], [field]: value } as Language;
      return { ...prev, languages: copy };
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-lg font-bold">Languages</h2>
        <button onClick={() => setData((p) => ({ ...p, languages: [...p.languages, emptyLang()] }))} className="btn btn-secondary text-sm flex items-center gap-1">
          <Plus size={14} /> Add Language
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-4">Multilingual candidates are highly valued in the UAE. Include Arabic if you speak it &mdash; even at basic level.</p>

      <div className="space-y-3">
        {languages.map((lang, i) => (
          <div key={i} className="flex items-end gap-3 border border-gray-200 rounded-xl p-3 bg-gray-50/50 relative">
            {languages.length > 1 && (
              <button onClick={() => setData((p) => ({ ...p, languages: p.languages.filter((_, idx) => idx !== i) }))}
                className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
            )}
            <div className="flex-1">
              <Field label="Language">
                <input className="input" value={lang.language} onChange={(e) => update(i, 'language', e.target.value)} placeholder="Arabic / English / Hindi..." />
              </Field>
            </div>
            <div className="flex-1">
              <Field label="Proficiency">
                <select className="input" value={lang.proficiency} onChange={(e) => update(i, 'proficiency', e.target.value)}>
                  {PROFICIENCY_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── Step 6: Certifications ── */
function StepCertifications({ certifications, setData }: { certifications: Certification[]; setData: React.Dispatch<React.SetStateAction<CVData>> }) {
  const update = (idx: number, field: keyof Certification, value: string) => {
    setData((prev) => {
      const copy = [...prev.certifications];
      copy[idx] = { ...copy[idx], [field]: value };
      return { ...prev, certifications: copy };
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-lg font-bold">Certifications &amp; Training</h2>
        <button onClick={() => setData((p) => ({ ...p, certifications: [...p.certifications, emptyCert()] }))} className="btn btn-secondary text-sm flex items-center gap-1">
          <Plus size={14} /> Add Certification
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-4">Professional certifications strengthen your CV &mdash; PMP, CFA, AWS, CIPD, NEBOSH, and others are highly regarded in the UAE.</p>

      <div className="space-y-4">
        {certifications.map((cert, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-4 relative bg-gray-50/50">
            {certifications.length > 1 && (
              <button onClick={() => setData((p) => ({ ...p, certifications: p.certifications.filter((_, idx) => idx !== i) }))}
                className="absolute top-3 right-3 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Certification Name">
                <input className="input" value={cert.name} onChange={(e) => update(i, 'name', e.target.value)} placeholder="PMP - Project Management Professional" />
              </Field>
              <Field label="Issuing Organization">
                <input className="input" value={cert.issuer} onChange={(e) => update(i, 'issuer', e.target.value)} placeholder="Project Management Institute (PMI)" />
              </Field>
              <Field label="Date Obtained">
                <input className="input" value={cert.date} onChange={(e) => update(i, 'date', e.target.value)} placeholder="Mar 2023" />
              </Field>
              <Field label="Expiration Date (if any)">
                <input className="input" value={cert.expiry} onChange={(e) => update(i, 'expiry', e.target.value)} placeholder="Mar 2026" />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── Step 7: References ── */
function StepReferences({ references, up }: { references: string; up: (p: string, v: any) => void }) {
  return (
    <>
      <h2 className="text-lg font-bold mb-1">References</h2>
      <p className="text-sm text-gray-500 mb-4">Most UAE CVs include &ldquo;Available upon request.&rdquo; You can also list specific references if preferred.</p>
      <textarea
        className="input min-h-[120px]"
        value={references}
        onChange={(e) => up('references', e.target.value)}
        placeholder={`Available upon request\n\n— or —\n\n1. John Smith, Director of Operations, Emirates Group\n   Email: john.smith@emirates.com | Phone: +971 4 XXX XXXX\n\n2. Sara Ahmed, HR Manager, Emaar Properties\n   Email: sara.ahmed@emaar.com | Phone: +971 4 XXX XXXX`}
      />
      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-xs text-amber-700 font-medium mb-1">Before you finish:</p>
        <ul className="text-xs text-amber-600 space-y-0.5 list-disc list-inside">
          <li>Review your CV preview on the right before downloading</li>
          <li>Ensure your visa status is accurate and up-to-date</li>
          <li>Double-check your phone number includes the country code (+971)</li>
          <li>Use the &ldquo;Download PDF&rdquo; button below or in the navigation</li>
        </ul>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════
   SHARED UI COMPONENTS
   ══════════════════════════════════════════════════════ */

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-[10px] font-bold tracking-wider mb-1.5 uppercase" style={{ color: ACCENT_LIGHT }}>{title}</div>
      <div className="w-full h-px mb-2" style={{ background: 'rgba(255,255,255,0.1)' }} />
      {children}
    </div>
  );
}

function SidebarItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-2 mb-1.5 text-xs" style={{ color: SIDEBAR_TEXT }}>
      <span className="mt-0.5 opacity-60">{icon}</span>
      <span className="break-all">{text}</span>
    </div>
  );
}

function SidebarDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-1.5">
      <div className="text-[9px] uppercase tracking-wide opacity-50">{label}</div>
      <div className="text-xs" style={{ color: SIDEBAR_TEXT }}>{value}</div>
    </div>
  );
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-xs font-bold tracking-wider uppercase mb-1.5 pb-1 border-b-2" style={{ color: ACCENT, borderColor: ACCENT }}>
        {title}
      </h3>
      {children}
    </div>
  );
}
