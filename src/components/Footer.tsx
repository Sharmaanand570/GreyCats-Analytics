
import { Link } from 'react-router-dom';
import { Lock, ShieldCheck, Linkedin } from 'lucide-react';
import logoBlack from '@/assets/images/greycats-black-logo.png';

export default function Footer() {
  return (
    <footer className="bg-[#fcfcfc] border-t border-[#eaeaea] py-16 px-6 relative z-10 font-sans mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-5 lg:col-span-6 flex flex-col items-start">
            <Link to="/" className="inline-block mb-6 transition-opacity hover:opacity-80">
              <img src={logoBlack} alt="GreyCats Analytics" className="h-8 w-auto object-contain" />
            </Link>
            <p className="text-[#666] mb-8 leading-relaxed max-w-sm text-sm font-medium">
              Operated by Greycats Tech LLP. <br />
              Simplify your reporting workflow with the most reliable platform for marketing agencies and analysts.
            </p>
            <div className="flex items-center gap-5 text-[#888]">
              <a href="https://www.linkedin.com/company/greycats-tech-llp/" className="hover:text-[#111] transition-colors p-2 -ml-2 rounded-full hover:bg-gray-100" target="_blank" rel="noreferrer">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div className="md:col-span-7 lg:col-span-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h4 className="font-bold text-[#111] mb-6 uppercase tracking-widest text-xs">Product</h4>
                <ul className="space-y-4 text-[#666] font-medium text-sm">
                  <li><Link to="/pricing" className="hover:text-[#111] transition-colors inline-block">Plans & Pricing</Link></li>
                  <li><Link to="/features" className="hover:text-[#111] transition-colors inline-block">Features</Link></li>
                  <li><Link to="/integrations-info" className="hover:text-[#111] transition-colors inline-block">Integrations</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-[#111] mb-6 uppercase tracking-widest text-xs">Support</h4>
                <ul className="space-y-4 text-[#666] font-medium text-sm">
                  <li><Link to="/contact" className="hover:text-[#111] transition-colors inline-block">Contact Us</Link></li>
                  <li><a href="mailto:info@greycats.tech" className="hover:text-[#111] transition-colors inline-block">info@greycats.tech</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-[#111] mb-6 uppercase tracking-widest text-xs">Legal</h4>
                <ul className="space-y-4 text-[#666] font-medium text-sm">
                  <li><Link to="/privacy-policy" className="hover:text-[#111] transition-colors inline-block">Privacy Policy</Link></li>
                  <li><Link to="/terms-of-service" className="hover:text-[#111] transition-colors inline-block">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-[#eaeaea] flex flex-col md:flex-row items-center justify-between gap-6 text-[#666] font-medium text-sm">
          <p>© {new Date().getFullYear()} Greycats Tech LLP. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-2.5 transition-colors hover:text-[#111] cursor-default">
              <Lock className="w-4 h-4 text-[#888]" /> Secure Data
            </span>
            <span className="flex items-center gap-2.5 transition-colors hover:text-[#111] cursor-default">
              <ShieldCheck className="w-4 h-4 text-[#888]" /> Data Security
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
