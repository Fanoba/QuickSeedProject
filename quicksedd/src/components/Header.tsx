import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Sprout, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { label: "Nosotros", href: "/#about" },
  { label: "Proyectos", href: "/projects" },
  { label: "Donar", href: "/donate" },
  { label: "Contacto", href: "/#contact" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Sprout className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold font-serif text-primary">QuickSeed</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link key={item.href} to={item.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">Hola, {user.nombre.split(" ")[0]}</span>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm">Admin</Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-1" /> Salir
              </Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Iniciar Sesión</Button></Link>
              <Link to="/donate"><Button size="sm">Donar</Button></Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4 space-y-3">
          {navItems.map((item) => (
            <Link key={item.href} to={item.href} className="block text-sm font-medium text-muted-foreground hover:text-primary" onClick={() => setMobileOpen(false)}>
              {item.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            {user ? (
              <Button variant="outline" size="sm" className="w-full" onClick={() => { logout(); setMobileOpen(false); }}>
                <LogOut className="h-4 w-4 mr-1" /> Salir
              </Button>
            ) : (
              <>
                <Link to="/login" className="flex-1"><Button variant="outline" size="sm" className="w-full" onClick={() => setMobileOpen(false)}>Iniciar Sesión</Button></Link>
                <Link to="/donate" className="flex-1"><Button size="sm" className="w-full" onClick={() => setMobileOpen(false)}>Donar</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
