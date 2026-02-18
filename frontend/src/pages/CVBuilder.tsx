import { useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { jsPDF } from 'jspdf';
import { useAuthStore } from '../store/authStore';
import { candidateService } from '../services/candidates';
import toast from 'react-hot-toast';

interface Experience {
  company: string;
  role: string;
  from: string;
  to: string;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  year: string;
}

export default function CVBuilder() {
  const { isAuthenticated, user } = useAuthStore();
  const isCandidate = isAuthenticated && user?.role === 'CANDIDATE';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState('');

  const [experiences, setExperiences] = useState<Experience[]>([
    { company: '', role: '', from: '', to: '', description: '' },
  ]);

  const [educations, setEducations] = useState<Education[]>([
    { institution: '', degree: '', year: '' },
  ]);

  const [uploading, setUploading] = useState(false);

  const addExperience = () => {
    setExperiences([...experiences, { company: '', role: '', from: '', to: '', description: '' }]);
  };

  const removeExperience = (i: number) => {
    setExperiences(experiences.filter((_, idx) => idx !== i));
  };

  const updateExperience = (i: number, field: keyof Experience, value: string) => {
    const updated = [...experiences];
    updated[i] = { ...updated[i], [field]: value };
    setExperiences(updated);
  };

  const addEducation = () => {
    setEducations([...educations, { institution: '', degree: '', year: '' }]);
  };

  const removeEducation = (i: number) => {
    setEducations(educations.filter((_, idx) => idx !== i));
  };

  const updateEducation = (i: number, field: keyof Education, value: string) => {
    const updated = [...educations];
    updated[i] = { ...updated[i], [field]: value };
    setEducations(updated);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const textWidth = pageWidth - margin * 2;

    // Name
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(fullName || 'Your Name', margin, y);
    y += 10;

    // Contact line
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const contactParts = [email, phone, location].filter(Boolean);
    if (contactParts.length) {
      doc.text(contactParts.join('  |  '), margin, y);
      y += 8;
    }

    // Divider
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Summary
    if (summary.trim()) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('PROFESSIONAL SUMMARY', margin, y);
      y += 7;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const summaryLines = doc.splitTextToSize(summary, textWidth);
      doc.text(summaryLines, margin, y);
      y += summaryLines.length * 5 + 8;
    }

    // Experience
    const filledExp = experiences.filter((e) => e.role || e.company);
    if (filledExp.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('WORK EXPERIENCE', margin, y);
      y += 7;

      for (const exp of filledExp) {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(exp.role || 'Role', margin, y);
        y += 5;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const dateStr = [exp.from, exp.to].filter(Boolean).join(' - ');
        doc.text(`${exp.company || 'Company'}${dateStr ? '  |  ' + dateStr : ''}`, margin, y);
        y += 5;
        if (exp.description) {
          const descLines = doc.splitTextToSize(exp.description, textWidth);
          doc.text(descLines, margin, y);
          y += descLines.length * 5;
        }
        y += 5;
      }
      y += 3;
    }

    // Education
    const filledEdu = educations.filter((e) => e.degree || e.institution);
    if (filledEdu.length > 0) {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('EDUCATION', margin, y);
      y += 7;

      for (const edu of filledEdu) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(edu.degree || 'Degree', margin, y);
        y += 5;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${edu.institution || 'Institution'}${edu.year ? '  |  ' + edu.year : ''}`, margin, y);
        y += 8;
      }
      y += 3;
    }

    // Skills
    if (skills.trim()) {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('SKILLS', margin, y);
      y += 7;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const skillLines = doc.splitTextToSize(skills, textWidth);
      doc.text(skillLines, margin, y);
    }

    return doc;
  };

  const handleDownload = () => {
    const doc = generatePDF();
    doc.save(`${fullName || 'cv'}-resume.pdf`);
    toast.success('CV downloaded!');
  };

  const handleUploadToProfile = async () => {
    if (!isCandidate) { toast.error('Log in as a candidate to save to your profile'); return; }
    setUploading(true);
    try {
      const doc = generatePDF();
      const blob = doc.output('blob');
      const file = new File([blob], `${fullName || 'cv'}-resume.pdf`, { type: 'application/pdf' });
      await candidateService.uploadCV(file);
      toast.success('CV saved to your profile!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save CV');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="bg-gradient-to-r from-green-600 to-teal-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">CV Builder</h1>
          <p className="text-lg text-green-100">
            Create a professional CV in minutes — completely free
          </p>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Personal Info */}
          <div className="card mb-6">
            <h2 className="text-xl font-bold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+971 50 123 4567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Dubai, UAE" />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="card mb-6">
            <h2 className="text-xl font-bold mb-4">Professional Summary</h2>
            <textarea
              className="input min-h-[100px]"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief overview of your professional background and key strengths..."
            />
          </div>

          {/* Work Experience */}
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Work Experience</h2>
              <button onClick={addExperience} className="btn btn-secondary text-sm">+ Add</button>
            </div>
            <div className="space-y-6">
              {experiences.map((exp, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 relative">
                  {experiences.length > 1 && (
                    <button onClick={() => removeExperience(i)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 text-sm">Remove</button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                      <input className="input" value={exp.role} onChange={(e) => updateExperience(i, 'role', e.target.value)} placeholder="Software Engineer" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <input className="input" value={exp.company} onChange={(e) => updateExperience(i, 'company', e.target.value)} placeholder="Acme Corp" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                      <input className="input" value={exp.from} onChange={(e) => updateExperience(i, 'from', e.target.value)} placeholder="Jan 2020" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                      <input className="input" value={exp.to} onChange={(e) => updateExperience(i, 'to', e.target.value)} placeholder="Present" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea className="input min-h-[60px]" value={exp.description} onChange={(e) => updateExperience(i, 'description', e.target.value)} placeholder="Key responsibilities and achievements..." />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Education</h2>
              <button onClick={addEducation} className="btn btn-secondary text-sm">+ Add</button>
            </div>
            <div className="space-y-4">
              {educations.map((edu, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 relative">
                  {educations.length > 1 && (
                    <button onClick={() => removeEducation(i)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 text-sm">Remove</button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                      <input className="input" value={edu.degree} onChange={(e) => updateEducation(i, 'degree', e.target.value)} placeholder="BSc Computer Science" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                      <input className="input" value={edu.institution} onChange={(e) => updateEducation(i, 'institution', e.target.value)} placeholder="University of Dubai" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                      <input className="input" value={edu.year} onChange={(e) => updateEducation(i, 'year', e.target.value)} placeholder="2020" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="card mb-6">
            <h2 className="text-xl font-bold mb-4">Skills</h2>
            <textarea
              className="input min-h-[80px]"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="JavaScript, React, Node.js, Python, Project Management, Communication..."
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            <button onClick={handleDownload} className="btn btn-primary px-8">
              Download as PDF
            </button>
            {isCandidate && (
              <button onClick={handleUploadToProfile} disabled={uploading} className="btn btn-secondary px-8">
                {uploading ? 'Saving...' : 'Save as My CV'}
              </button>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
