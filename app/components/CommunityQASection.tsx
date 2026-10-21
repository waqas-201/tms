"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  Search,
  ChevronDown,
  MessageCircle,
  Sparkles,
  Send,
  UserCheck,
  Building2,
  Stethoscope,
  HeartHandshake,
  CheckCircle2,
} from "lucide-react";
import Reveal from "./motion/Reveal";
import { CLINIC_INFO } from "@/app/data/products";
import { motion, AnimatePresence } from "framer-motion";

interface QAItem {
  id: string;
  category: "digestion" | "joints" | "liver" | "diet" | "general";
  question: string;
  askedBy: string;
  city: string;
  answer: string;
  hakimAdvice: string[];
}

const COMMUNITY_QA_DATA: QAItem[] = [
  {
    id: "qa-1",
    category: "digestion",
    question: "Why do I feel extreme bloating, gas, and burning after eating heavy or fried food?",
    askedBy: "Zubair K.",
    city: "Karachi",
    answer:
      "In classical Unani Tibb, this condition is diagnosed as 'Zoafe Meda' (Weak Digestive Fire). When stomach enzymes and bile secretions are insufficient, food stagnates in the gut, fermenting and producing foul gas, chest burning, and upward acid reflux.",
    hakimAdvice: [
      "Avoid ice-cold water immediately after oily or heavy meals.",
      "Take 30ml Arq Makoh mixed with 30ml Arq Kasni 15 minutes before lunch & dinner.",
      "Chew one piece of Harar Murabba in the morning on an empty stomach.",
    ],
  },
  {
    id: "qa-2",
    category: "joints",
    question: "Can herbal treatment help dry joint fluid (Godaon ka le'aab) in knee osteoarthritis?",
    askedBy: "Parveen Begum",
    city: "Lahore",
    answer:
      "Yes. Classical herbs like Suranjan-e-Shireen, Asgandh, and Bamboo Silicate (Murabba Baans) stimulate internal lubricating fluids (Rutubat-e-Saleha) and reduce chronic synovial inflammation without harming the kidneys or stomach.",
    hakimAdvice: [
      "Massage JointZen herbal oil twice daily with gentle upward strokes.",
      "Avoid sour foods (Khattai, pickles) and cold refrigerated drinks.",
      "Take 1 teaspoon of Murabba Baans with warm milk every morning.",
    ],
  },
  {
    id: "qa-3",
    category: "liver",
    question: "How do I know if I have excessive body heat (Garam Mizaj) or liver sluggishness?",
    askedBy: "Adeel R.",
    city: "Peshawar",
    answer:
      "Common indicators include dark yellow urine, burning in the soles of feet and palms, frequent mouth ulcers, afternoon lethargy, and a bitter morning taste in the mouth.",
    hakimAdvice: [
      "Drink Arq Kasni (Chicory distillate) regularly for 21 days.",
      "Incorporate Tukhm-e-Balgah (Basil seeds) and Ispaghol husk in your weekly hydration routine.",
      "Reduce red meat, spicy fast foods, and late-night fried items.",
    ],
  },
  {
    id: "qa-4",
    category: "diet",
    question: "What is the best natural morning routine for longevity and stamina according to Tibb?",
    askedBy: "Hamza M.",
    city: "Islamabad",
    answer:
      "According to Hakim tradition, start your day with room-temperature water infused with a teaspoon of pure wild honey and 1 piece of Amla or Apple Murabba. This strengthens cardiac muscles, purifies the bloodstream, and sharpens mental focus.",
    hakimAdvice: [
      "Consume Amla Murabba on an empty stomach for vitamin C & liver rejuvenation.",
      "Allow at least 20 minutes before consuming heavy breakfast or tea.",
      "Maintain a 10-minute morning breathwork or light walk.",
    ],
  },
  {
    id: "qa-5",
    category: "general",
    question: "Are Tameer-e-Sehat Arqiyat and Murabbajaat safe for diabetic and elderly patients?",
    askedBy: "Dr. Nadeem S.",
    city: "Multan",
    answer:
      "All Arqiyat (pure hydro-distillates like Arq Gulab, Arq Kasni, Arq Makoh) are 100% sugar-free, steroid-free, and chemical-free, making them completely safe for diabetic and hypertensive patients. For Murabba preserves, diabetic patients are advised to rinse the sugar glaze in lukewarm water before eating.",
    hakimAdvice: [
      "Pure Arqiyat contain 0% sugar and can be taken freely.",
      "Consult Hakim Sahib via WhatsApp for customized sugar-free formulations.",
    ],
  },
];

export default function CommunityQASection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string>("qa-1");

  // Interactive Question Submission Form
  const [askQuestion, setAskQuestion] = useState("");
  const [askName, setAskName] = useState("");
  const [askCity, setAskCity] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const filteredQA = COMMUNITY_QA_DATA.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!askQuestion.trim()) return;

    // Launch direct WhatsApp with pre-filled question
    const message = `*Assalam-o-Alaikum Hakim Sahib (Community Health Question)*\n` +
      `*Name:* ${askName || "Patient"}\n` +
      `*City:* ${askCity || "Pakistan"}\n` +
      `*My Health Question:* ${askQuestion}\n\n` +
      `_Please provide your clinical guidance when available. JazakAllah._`;

    const url = `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");

    setSubmitted(true);
    setAskQuestion("");
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section id="community-qa" className="py-16 sm:py-20 lg:py-24 bg-surface border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Section Header */}
        <Reveal className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green-50 border border-brand-green-200 text-primary text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-secondary-text" />
            <span>Community Knowledge Base</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
            Community Health Forum &amp; Hakim Q&amp;A
          </h2>

          <p className="text-xs sm:text-sm text-ink-body">
            Common patient health questions answered with classical Unani wisdom.
          </p>

          {/* Search bar */}
          <div className="pt-2 max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-ink-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search symptoms, remedies (e.g. gas, liver, joints)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white rounded-xl border border-line text-ink focus:outline-none focus:border-primary shadow-2xs transition-colors"
            />
          </div>
        </Reveal>

        {/* Main Grid: QA Accordion (7 cols) + Ask Hakim Box (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Community Questions & Answers Accordion */}
          <div className="lg:col-span-7 space-y-3.5">
            {filteredQA.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-line text-center space-y-3">
                <p className="text-xs text-ink-body">
                  No matching health question found for &ldquo;{searchTerm}&rdquo;.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className="text-xs font-bold text-primary underline"
                >
                  Clear search filters
                </button>
              </div>
            ) : (
              filteredQA.map((item, idx) => {
                const isExpanded = expandedId === item.id;
                return (
                  <Reveal key={item.id} delay={idx * 0.03}>
                    <div className="bg-white rounded-2xl border border-line overflow-hidden transition-all shadow-xs hover:border-primary/30">
                      {/* Accordion Header */}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(isExpanded ? "" : item.id)
                        }
                        className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-surface transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[11px] text-ink-subtle">
                            <span className="font-semibold text-primary bg-brand-green-50 px-2 py-0.5 rounded">
                              Asked by {item.askedBy} ({item.city})
                            </span>
                          </div>
                          <h4 className="font-serif text-xs sm:text-sm font-bold text-ink leading-snug">
                            {item.question}
                          </h4>
                        </div>
                        <div
                          className={`w-7 h-7 rounded-full bg-surface border border-line flex items-center justify-center shrink-0 text-primary transition-all duration-200 ${
                            isExpanded ? "rotate-180 bg-primary text-white" : ""
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </button>

                      {/* Accordion Content with smooth height animation */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-sand-100 space-y-3.5 text-xs">
                              {/* Diagnostic Answer */}
                              <div className="space-y-1 text-ink-body leading-relaxed">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-text block">
                                  Clinical Assessment:
                                </span>
                                <p>{item.answer}</p>
                              </div>

                              {/* Hakim's Step-by-Step Guidance */}
                              <div className="p-3.5 bg-brand-gold-50 rounded-xl border border-line space-y-2">
                                <div className="flex items-center gap-2 font-bold text-primary text-xs">
                                  <Stethoscope className="w-3.5 h-3.5 text-secondary-text" />
                                  <span>Hakim Tahir Hameed&apos;s Advice:</span>
                                </div>
                                <ul className="space-y-1 pl-1">
                                  {item.hakimAdvice.map((adv, aIdx) => (
                                    <li
                                      key={aIdx}
                                      className="flex items-start gap-2 text-[11px] text-neutral-800"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-1.5" />
                                      <span>{adv}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Reveal>
                );
              })
            )}
          </div>

          {/* Right Column: Interactive "Ask Hakim a Health Question" Form */}
          <div className="lg:col-span-5">
            <Reveal delay={0.08}>
              <div className="bg-white rounded-2xl border border-line p-5 sm:p-6 shadow-xs space-y-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary-text">
                    <HeartHandshake className="w-4 h-4 text-primary" />
                    <span>Free Community Health Help</span>
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-primary">
                    Ask Hakim Sahib a Question
                  </h3>
                  <p className="text-xs text-ink-body">
                    Have a chronic symptom? Send it directly to Hakim Sahib on WhatsApp.
                  </p>
                </div>

                {submitted && (
                  <div className="p-3 bg-brand-green-50 border border-brand-green-200 rounded-xl text-xs text-primary flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>WhatsApp conversation opened with Hakim Sahib!</span>
                  </div>
                )}

                <form onSubmit={handleAskSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={askName}
                      onChange={(e) => setAskName(e.target.value)}
                      placeholder="e.g. Asad Ullah"
                      className="w-full text-xs px-3 py-2 bg-surface border border-line rounded-xl text-ink focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink">
                      Your City
                    </label>
                    <input
                      type="text"
                      value={askCity}
                      onChange={(e) => setAskCity(e.target.value)}
                      placeholder="e.g. Karachi, Lahore, Islamabad"
                      className="w-full text-xs px-3 py-2 bg-surface border border-line rounded-xl text-ink focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink">
                      Your Health Question <span className="text-danger">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={askQuestion}
                      onChange={(e) => setAskQuestion(e.target.value)}
                      placeholder="Describe your symptoms or ask about remedies..."
                      className="w-full text-xs p-2.5 bg-surface border border-line rounded-xl text-ink focus:outline-none focus:border-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-whatsapp hover:bg-whatsapp-hover text-on-whatsapp text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 active:scale-98"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Send to Hakim on WhatsApp</span>
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-ink-subtle pt-0.5">
                    <UserCheck className="w-3 h-3 text-primary" />
                    <span>Confidential · Direct Review by Certified Hakim</span>
                  </div>
                </form>
              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
}
