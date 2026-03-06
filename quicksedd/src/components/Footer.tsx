import { Link } from "react-router-dom";
import { Heart, Sprout } from "lucide-react";

const Footer = () => (
  <footer id="contact" className="bg-foreground text-primary-foreground">
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Sprout className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold font-serif">QuickSeed</span>
          </div>
          <p className="text-sm opacity-70">Plataforma de donaciones transparente con cumplimiento legal y tecnología de verificación avanzada.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">Navegación</h4>
          <div className="space-y-2 text-sm opacity-70">
            <Link to="/" className="block hover:opacity-100">Inicio</Link>
            <Link to="/projects" className="block hover:opacity-100">Proyectos</Link>
            <Link to="/donate" className="block hover:opacity-100">Donar</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">Legal</h4>
          <div className="space-y-2 text-sm opacity-70">
            <p>Aviso de Privacidad</p>
            <p>Términos y Condiciones</p>
            <p>Política AML/KYC</p>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">Contacto</h4>
          <div className="space-y-2 text-sm opacity-70">
            <p>info@quickseed.org</p>
            <p>+52 (55) 1234-5678</p>
            <p>CDMX, México</p>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm opacity-50 flex items-center justify-center gap-1">
        © 2026 QuickSeed. Hecho con <Heart className="h-3 w-3 fill-current text-accent" /> en México.
      </div>
    </div>
  </footer>
);

export default Footer;
