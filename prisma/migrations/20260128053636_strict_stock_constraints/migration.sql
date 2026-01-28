-- Add check constraints to ensure stock validity
ALTER TABLE "Ejemplar" ADD CONSTRAINT "check_cantidad_disponible_positive" CHECK ("cantidadDisponible" >= 0);
ALTER TABLE "Ejemplar" ADD CONSTRAINT "check_cantidad_disponible_lte_total" CHECK ("cantidadDisponible" <= "cantidadTotal");