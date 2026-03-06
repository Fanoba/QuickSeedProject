import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sprout } from "lucide-react";

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
    <Sprout className="h-16 w-16 text-primary mb-6 opacity-50" />
    <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
    <p className="text-xl text-muted-foreground mb-8">Página no encontrada</p>
    <Link to="/">
      <Button size="lg">Volver al inicio</Button>
    </Link>
  </div>
);

export default NotFound;
