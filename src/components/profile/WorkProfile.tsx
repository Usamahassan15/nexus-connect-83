import { Briefcase, Star, MapPin, Award, Clock, Users, Edit, Save, X, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3 } }),
};

interface Experience {
  role: string;
  company: string;
  period: string;
  description: string;
}

interface Service {
  title: string;
  rate: string;
  description: string;
}

interface Portfolio {
  title: string;
  image: string;
  category: string;
}

const defaultData = {
  summary: "Passionate software engineer with 5+ years of experience building modern web applications. Specialized in React ecosystem and scalable architecture. Open to freelance projects and collaborations.",
  location: "San Francisco, CA",
  skills: ["React", "TypeScript", "Node.js", "UI/UX Design", "Project Management", "Python"],
  services: [
    { title: "Web Development", rate: "$80/hr", description: "Full-stack web application development" },
    { title: "UI/UX Consulting", rate: "$60/hr", description: "Design review and user experience optimization" },
    { title: "Technical Mentoring", rate: "$50/hr", description: "1-on-1 coaching for developers" },
  ] as Service[],
  experience: [
    { role: "Senior Software Engineer", company: "TechCorp Inc.", period: "2022 - Present", description: "Leading frontend architecture and mentoring junior developers." },
    { role: "Full Stack Developer", company: "StartupXYZ", period: "2020 - 2022", description: "Built scalable web applications serving 100K+ users." },
  ] as Experience[],
  portfolio: [
    { title: "E-Commerce Platform", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop", category: "Web App" },
    { title: "Health & Fitness App", image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop", category: "Mobile" },
    { title: "Dashboard Analytics", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop", category: "Web App" },
    { title: "Social Media Tool", image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop", category: "SaaS" },
  ] as Portfolio[],
};

const serviceIcons = [Briefcase, Star, Users];

export default function WorkProfile({ readOnly = false }: { readOnly?: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState(defaultData);
  const [draft, setDraft] = useState(defaultData);
  const [newSkill, setNewSkill] = useState("");

  const startEditing = () => {
    setDraft({ ...data, skills: [...data.skills], services: data.services.map(s => ({ ...s })), experience: data.experience.map(e => ({ ...e })), portfolio: data.portfolio.map(p => ({ ...p })) });
    setIsEditing(true);
  };

  const saveChanges = () => {
    setData(draft);
    setIsEditing(false);
    toast({ title: "Profile updated", description: "Your work profile has been saved." });
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setNewSkill("");
  };

  const addSkill = () => {
    if (newSkill.trim() && !draft.skills.includes(newSkill.trim())) {
      setDraft({ ...draft, skills: [...draft.skills, newSkill.trim()] });
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setDraft({ ...draft, skills: draft.skills.filter(s => s !== skill) });
  };

  const updateService = (i: number, field: keyof Service, value: string) => {
    const services = [...draft.services];
    services[i] = { ...services[i], [field]: value };
    setDraft({ ...draft, services });
  };

  const removeService = (i: number) => {
    setDraft({ ...draft, services: draft.services.filter((_, idx) => idx !== i) });
  };

  const addService = () => {
    setDraft({ ...draft, services: [...draft.services, { title: "", rate: "", description: "" }] });
  };

  const updateExperience = (i: number, field: keyof Experience, value: string) => {
    const experience = [...draft.experience];
    experience[i] = { ...experience[i], [field]: value };
    setDraft({ ...draft, experience });
  };

  const removeExperience = (i: number) => {
    setDraft({ ...draft, experience: draft.experience.filter((_, idx) => idx !== i) });
  };

  const addExperience = () => {
    setDraft({ ...draft, experience: [...draft.experience, { role: "", company: "", period: "", description: "" }] });
  };

  const currentData = isEditing ? draft : data;

  return (
    <div className="space-y-5">
      {/* Edit / Save / Cancel buttons */}
      <div className="flex justify-end gap-2">
        {isEditing ? (
          <>
            <Button variant="outline" size="sm" onClick={cancelEditing} className="gap-1.5">
              <X className="w-3.5 h-3.5" /> Cancel
            </Button>
            <Button size="sm" onClick={saveChanges} className="gap-1.5">
              <Save className="w-3.5 h-3.5" /> Save Changes
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={startEditing} className="gap-1.5">
            <Edit className="w-3.5 h-3.5" /> Edit Work Profile
          </Button>
        )}
      </div>

      {/* Professional Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Professional Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isEditing ? (
            <>
              <Textarea value={draft.summary} onChange={e => setDraft({ ...draft, summary: e.target.value })} rows={3} className="text-sm" />
              <Input value={draft.location} onChange={e => setDraft({ ...draft, location: e.target.value })} placeholder="Location" className="text-sm" />
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground leading-relaxed">{data.summary}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{data.location}</div>
                <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Available for hire</div>
                <div className="flex items-center gap-1"><Award className="w-3.5 h-3.5" />Top Rated</div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {currentData.skills.map((skill, i) => (
              <motion.div key={skill} custom={i} initial="hidden" animate="visible" variants={itemVariants}>
                <Badge variant="secondary" className="text-xs sm:text-sm px-3 py-1 gap-1">
                  {skill}
                  {isEditing && (
                    <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              </motion.div>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-2 mt-3">
              <Input value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="Add skill" className="text-sm h-8" onKeyDown={e => e.key === "Enter" && addSkill()} />
              <Button size="sm" variant="outline" onClick={addSkill} className="h-8"><Plus className="w-3.5 h-3.5" /></Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentData.services.map((service, i) => {
            const Icon = serviceIcons[i % serviceIcons.length];
            return (
              <motion.div key={i} custom={i} initial="hidden" animate="visible" variants={itemVariants}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                {isEditing ? (
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex gap-2">
                      <Input value={service.title} onChange={e => updateService(i, "title", e.target.value)} placeholder="Title" className="text-sm h-8 flex-1" />
                      <Input value={service.rate} onChange={e => updateService(i, "rate", e.target.value)} placeholder="Rate" className="text-sm h-8 w-24" />
                      <Button size="sm" variant="ghost" onClick={() => removeService(i)} className="h-8 w-8 p-0 text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                    <Input value={service.description} onChange={e => updateService(i, "description", e.target.value)} placeholder="Description" className="text-sm h-8" />
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-medium text-foreground truncate">{service.title}</h4>
                      <span className="text-xs font-semibold text-primary shrink-0">{service.rate}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{service.description}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
          {isEditing && (
            <Button variant="outline" size="sm" onClick={addService} className="w-full gap-1.5 mt-1">
              <Plus className="w-3.5 h-3.5" /> Add Service
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentData.experience.map((exp, i) => (
            <motion.div key={i} custom={i} initial="hidden" animate="visible" variants={itemVariants}
              className="relative pl-4 border-l-2 border-primary/30"
            >
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input value={exp.role} onChange={e => updateExperience(i, "role", e.target.value)} placeholder="Role" className="text-sm h-8 flex-1" />
                    <Button size="sm" variant="ghost" onClick={() => removeExperience(i)} className="h-8 w-8 p-0 text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                  <div className="flex gap-2">
                    <Input value={exp.company} onChange={e => updateExperience(i, "company", e.target.value)} placeholder="Company" className="text-sm h-8 flex-1" />
                    <Input value={exp.period} onChange={e => updateExperience(i, "period", e.target.value)} placeholder="Period" className="text-sm h-8 w-36" />
                  </div>
                  <Input value={exp.description} onChange={e => updateExperience(i, "description", e.target.value)} placeholder="Description" className="text-sm h-8" />
                </div>
              ) : (
                <>
                  <h4 className="text-sm font-semibold text-foreground">{exp.role}</h4>
                  <p className="text-xs text-primary font-medium">{exp.company}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{exp.period}</p>
                  <p className="text-xs text-muted-foreground mt-1">{exp.description}</p>
                </>
              )}
            </motion.div>
          ))}
          {isEditing && (
            <Button variant="outline" size="sm" onClick={addExperience} className="w-full gap-1.5 mt-1">
              <Plus className="w-3.5 h-3.5" /> Add Experience
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Portfolio */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {currentData.portfolio.map((item, i) => (
              <motion.div key={i} custom={i} initial="hidden" animate="visible" variants={itemVariants}
                className="group relative overflow-hidden rounded-lg cursor-pointer"
              >
                <img src={item.image} alt={item.title} className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2 sm:p-3">
                  <h4 className="text-xs sm:text-sm font-medium text-primary-foreground">{item.title}</h4>
                  <span className="text-[10px] sm:text-xs text-primary-foreground/80">{item.category}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hire Button */}
      <div className="pb-4">
        <Button className="w-full h-11 text-sm font-semibold gap-2">
          <Briefcase className="w-4 h-4" /> Hire Me
        </Button>
      </div>
    </div>
  );
}
