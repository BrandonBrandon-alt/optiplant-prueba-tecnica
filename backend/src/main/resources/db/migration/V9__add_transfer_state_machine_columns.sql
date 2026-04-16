ALTER TABLE transferencias ADD COLUMN parent_transfer_id BIGINT REFERENCES transferencias(id);
ALTER TABLE transferencias ADD COLUMN transportista VARCHAR(100);
ALTER TABLE transferencias ADD COLUMN notas_recepcion TEXT;
