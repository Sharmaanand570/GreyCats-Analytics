const fs=require('fs'); 
let landing = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8'); 
let hf = fs.readFileSync('scratch/high_fidelity_features.tsx', 'utf8'); 

let featuresData = hf.substring(hf.indexOf('const FEATURES_DATA'), hf.lastIndexOf('];') + 2); 
let featuresSection = hf.substring(hf.indexOf('const FeaturesSection'), hf.lastIndexOf('};') + 2); 

let newContent = landing.replace('const LandingPage', featuresData + '\n\n' + featuresSection + '\n\nconst LandingPage'); 

const startIdx = newContent.indexOf('<section id="how-it-works"'); 
const endStr = '</section>'; 
let endIdx = newContent.indexOf(endStr, startIdx); 

if(endIdx !== -1) { 
  endIdx += endStr.length; 
  newContent = newContent.substring(0, startIdx) + '<FeaturesSection />' + newContent.substring(endIdx); 
} 

newContent = newContent.replace('} from "lucide-react";', ', Settings, Database, TrendingDown, Filter, LayoutGrid, Download, AlertCircle, ChevronDown, Plus, ArrowUp, ArrowDown, Search, Image, Video, FileText, UploadCloud, ChevronLeft, ChevronRight, Twitter, Instagram, MessageSquare, Smartphone, Mail, MessageCircle, Calendar, Clock } from "lucide-react";'); 
newContent = newContent.replace('import { motion, AnimatePresence } from "motion/react";', 'import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";'); 

fs.writeFileSync('src/pages/LandingPage.tsx', newContent);
