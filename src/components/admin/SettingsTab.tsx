import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { AuditLog } from '../../types';
import {
  Palette,
  Settings,
  Phone,
  Mail,
  MapPin,
  Save,
  CheckCircle2,
  Users,
  Shield,
  Link,
  Plus,
  Trash2,
  Sparkles,
  History,
  RotateCcw,
  Loader2,
  Type,
  Database,
  Copy,
  Download,
  Terminal,
  Server,
  Layers,
  Code2,
  Monitor,
  UserCheck,
  Eye,
} from 'lucide-react';

const PRESET_THEMES = [
  {
    name: 'Guna Vibes Crema Original',
    bgColor: '#F5EFE6',
    primaryColor: '#0E9AA7',
    secondaryColor: '#E8622C',
    accentColor: '#F2B705',
    textColor: '#123C4B',
  },
  {
    name: 'Caribe Arena Suave',
    bgColor: '#FAF6EE',
    primaryColor: '#00838F',
    secondaryColor: '#FF6F00',
    accentColor: '#FFD54F',
    textColor: '#004D40',
  },
  {
    name: 'Marfil Cálido & Sol',
    bgColor: '#FCF9F2',
    primaryColor: '#0288D1',
    secondaryColor: '#D84315',
    accentColor: '#FBC02D',
    textColor: '#263238',
  },
  {
    name: 'Blanco Moderno Puro',
    bgColor: '#FFFFFF',
    primaryColor: '#0E9AA7',
    secondaryColor: '#E8622C',
    accentColor: '#F2B705',
    textColor: '#1E293B',
  },
];

const FONT_OPTIONS_HEADINGS = [
  { id: 'Outfit', name: 'Outfit (Moderno / Geométrico - Recomendado)' },
  { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans (Limpio & Elegante)' },
  { id: 'Playfair Display', name: 'Playfair Display (Serif / Editorial)' },
  { id: 'Montserrat', name: 'Montserrat (Imponente & Corporativo)' },
  { id: 'DM Sans', name: 'DM Sans (Minimalista)' },
  { id: 'Poppins', name: 'Poppins (Amigable & Redondeado)' },
  { id: 'Lora', name: 'Lora (Serif Tradicional)' },
  { id: 'Space Grotesk', name: 'Space Grotesk (Tech / Vanguardista)' },
];

const FONT_OPTIONS_BODY = [
  { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans (Legibilidad Óptima)' },
  { id: 'Inter', name: 'Inter (Neutral & Preciso)' },
  { id: 'DM Sans', name: 'DM Sans (Fluido & Ligero)' },
  { id: 'Montserrat', name: 'Montserrat (Robusto)' },
  { id: 'Open Sans', name: 'Open Sans (Clásico)' },
  { id: 'Outfit', name: 'Outfit (Contemporáneo)' },
  { id: 'Lora', name: 'Lora (Lectura Relajada)' },
];

const FONT_OPTIONS_BACKEND = [
  { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans (Recomendada Admin)' },
  { id: 'Inter', name: 'Inter (Alta densidad de datos)' },
  { id: 'DM Sans', name: 'DM Sans (Suave & Compacta)' },
  { id: 'Outfit', name: 'Outfit (Moderna)' },
  { id: 'Montserrat', name: 'Montserrat (Estructurada)' },
  { id: 'Fira Code', name: 'Fira Code (Técnica / Monospace)' },
];

const FRONTEND_FONT_SIZES = [
  { id: '14px', label: '14px (Compacto)' },
  { id: '15px', label: '15px (Medio)' },
  { id: '16px', label: '16px (Estándar Web - Recomendado)' },
  { id: '17px', label: '17px (Grande)' },
  { id: '18px', label: '18px (Muy Grande / Accesible)' },
];

const BACKEND_FONT_SIZES = [
  { id: '12px', label: '12px (Ultra Compacto / Tablas densas)' },
  { id: '13px', label: '13px (Compacto)' },
  { id: '14px', label: '14px (Estándar Panel - Recomendado)' },
  { id: '15px', label: '15px (Cómodo)' },
  { id: '16px', label: '16px (Grande)' },
  { id: '17px', label: '17px (Extra Grande)' },
];

const MYSQL_SCHEMA_SCRIPT = `-- ==========================================================
-- GUNA VIBES SAN BLAS - DDL COMPLETO DE BASE DE DATOS MYSQL
-- Servidor: MySQL 8.0+ / MariaDB 10.4+ / phpMyAdmin / Workbench
-- Charset: utf8mb4 / Collation: utf8mb4_unicode_ci
-- ==========================================================

CREATE DATABASE IF NOT EXISTS \`gunavibes_db\`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE \`gunavibes_db\`;

-- 1. TABLA DE USUARIOS ADMINISTRADORES & ROLES
CREATE TABLE IF NOT EXISTS \`admin_users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`nombre\` VARCHAR(120) NOT NULL,
  \`correo\` VARCHAR(150) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`rol\` ENUM('superadmin', 'admin', 'operador', 'guia') NOT NULL DEFAULT 'admin',
  \`activo\` TINYINT(1) NOT NULL DEFAULT 1,
  \`ultimo_acceso\` DATETIME NULL,
  \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`actualizado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_admin_correo\` (\`correo\`),
  INDEX \`idx_admin_rol\` (\`rol\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABLA DE CONFIGURACIÓN GLOBAL DEL SITIO & TEMAS
CREATE TABLE IF NOT EXISTS \`site_config\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`nombre_empresa\` VARCHAR(150) NOT NULL DEFAULT 'Guna Vibes',
  \`cupo_maximo_dia\` INT NOT NULL DEFAULT 14,
  \`telefono_contacto\` VARCHAR(50) NOT NULL DEFAULT '+507 6369-1775',
  \`correo_contacto\` VARCHAR(120) NOT NULL DEFAULT 'info@gunavibes.com',
  \`whatsapp\` VARCHAR(50) NOT NULL DEFAULT '+507 6369-1775',
  \`direccion\` TEXT NOT NULL,
  \`instagram_handle\` VARCHAR(80) NOT NULL DEFAULT 'gunavibes_sanblas',
  \`bg_color\` VARCHAR(20) NOT NULL DEFAULT '#F5EFE6',
  \`primary_color\` VARCHAR(20) NOT NULL DEFAULT '#0E9AA7',
  \`secondary_color\` VARCHAR(20) NOT NULL DEFAULT '#E8622C',
  \`accent_color\` VARCHAR(20) NOT NULL DEFAULT '#F2B705',
  \`text_color\` VARCHAR(20) NOT NULL DEFAULT '#123C4B',
  \`header_bg\` VARCHAR(20) NOT NULL DEFAULT '#123C4B',
  \`font_frontend_heading\` VARCHAR(60) NOT NULL DEFAULT 'Outfit',
  \`font_frontend_body\` VARCHAR(60) NOT NULL DEFAULT 'Plus Jakarta Sans',
  \`font_frontend_size\` VARCHAR(20) NOT NULL DEFAULT '16px',
  \`font_backend_body\` VARCHAR(60) NOT NULL DEFAULT 'Plus Jakarta Sans',
  \`font_backend_size\` VARCHAR(20) NOT NULL DEFAULT '14px',
  \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`actualizado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. ENLACES EXTERNOS DEL MENÚ SUPERIOR
CREATE TABLE IF NOT EXISTS \`external_menu_links\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`label\` VARCHAR(100) NOT NULL,
  \`url\` VARCHAR(255) NOT NULL,
  \`posicion\` INT NOT NULL DEFAULT 0,
  \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TOURS Y PAQUETES TURÍSTICOS DE SAN BLAS
CREATE TABLE IF NOT EXISTS \`packages\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`titulo_es\` VARCHAR(200) NOT NULL,
  \`titulo_en\` VARCHAR(200) NOT NULL,
  \`descripcion_es\` TEXT NOT NULL,
  \`descripcion_en\` TEXT NOT NULL,
  \`duracion_es\` VARCHAR(100) NOT NULL,
  \`duracion_en\` VARCHAR(100) NOT NULL,
  \`tipo_servicio\` ENUM('pasadia', 'cabana', 'velero', 'privado', 'camping') NOT NULL DEFAULT 'pasadia',
  \`precio_desde\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`incluye_es\` TEXT,
  \`incluye_en\` TEXT,
  \`no_incluye_es\` TEXT,
  \`no_incluye_en\` TEXT,
  \`itinerario_es\` TEXT,
  \`itinerario_en\` TEXT,
  \`imagen_url\` VARCHAR(500),
  \`galeria_json\` JSON,
  \`cupo_maximo_paquete\` INT NOT NULL DEFAULT 14,
  \`destacado\` TINYINT(1) NOT NULL DEFAULT 0,
  \`activo\` TINYINT(1) NOT NULL DEFAULT 1,
  \`orden\` INT NOT NULL DEFAULT 0,
  \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`actualizado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_packages_tipo\` (\`tipo_servicio\`),
  INDEX \`idx_packages_activo\` (\`activo\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. CLIENTES REGISTRADOS & LEADS (CONTROL DEL EMBUDO COMERCIAL)
CREATE TABLE IF NOT EXISTS \`registered_clients\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`nombre_completo\` VARCHAR(150) NOT NULL,
  \`telefono\` VARCHAR(50) NOT NULL,
  \`correo\` VARCHAR(150) NOT NULL,
  \`pais_procedencia\` VARCHAR(100) DEFAULT 'Panamá',
  \`codigo_pais\` VARCHAR(10) DEFAULT 'PA',
  \`idioma_preferido\` ENUM('es', 'en') DEFAULT 'es',
  \`origen_captacion\` ENUM('web_formulario', 'whatsapp', 'llamada', 'instagram', 'facebook', 'referido', 'agencia') DEFAULT 'web_formulario',
  \`paquete_interes\` VARCHAR(200) DEFAULT 'Pasadía Todo Incluido',
  \`paquete_id\` INT NULL,
  \`tipo_servicio_interes\` VARCHAR(100) DEFAULT 'pasadia',
  \`fecha_tentativa\` DATE NULL,
  \`cantidad_personas\` INT DEFAULT 1,
  \`monto_estimado\` DECIMAL(10,2) DEFAULT 0.00,
  \`estado_embudo\` ENUM('intencion_registrada', 'en_conversacion', 'cotizacion_enviada', 'pago_enviado', 'pago_completado', 'cancelado') DEFAULT 'intencion_registrada',
  \`notas_interaccion\` TEXT,
  \`ultimo_contacto\` DATETIME NULL,
  \`creado_por_admin_id\` INT NULL,
  \`acepta_notificaciones\` TINYINT(1) DEFAULT 1,
  \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`actualizado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_clients_correo\` (\`correo\`),
  INDEX \`idx_clients_telefono\` (\`telefono\`),
  INDEX \`idx_clients_estado\` (\`estado_embudo\`),
  INDEX \`idx_clients_pais\` (\`pais_procedencia\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. BITÁCORA DE INTERACCIONES Y SEGUIMIENTO DE LEADS
CREATE TABLE IF NOT EXISTS \`lead_notes\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`lead_id\` INT NOT NULL,
  \`admin_id\` INT NULL,
  \`tipo\` ENUM('nota', 'whatsapp', 'llamada', 'correo', 'cotizacion', 'pago') DEFAULT 'nota',
  \`contenido\` TEXT NOT NULL,
  \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`lead_id\`) REFERENCES \`registered_clients\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. RESERVAS OFICIALES & ESTADOS DE PAGO
CREATE TABLE IF NOT EXISTS \`reservations\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`codigo_reserva\` VARCHAR(50) NOT NULL UNIQUE,
  \`nombre_cliente\` VARCHAR(150) NOT NULL,
  \`correo_cliente\` VARCHAR(150) NOT NULL,
  \`telefono_cliente\` VARCHAR(50) NOT NULL,
  \`pais_procedencia\` VARCHAR(100) DEFAULT 'Panamá',
  \`lead_id\` INT NULL,
  \`paquete_id\` INT NULL,
  \`tipo_servicio\` ENUM('pasadia', 'cabana', 'velero', 'privado', 'camping') NOT NULL,
  \`fecha_viaje\` DATE NOT NULL,
  \`fecha_salida\` DATE NULL,
  \`cantidad_personas\` INT NOT NULL DEFAULT 1,
  \`monto_total\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`monto_adelanto\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`monto_pendiente\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`estado\` ENUM('pendiente', 'pago_enviado', 'confirmada', 'cancelada', 'completada') NOT NULL DEFAULT 'pendiente',
  \`metodo_pago\` ENUM('yappy', 'transferencia_banistmo', 'tarjeta_credito', 'efectivo_embarcadero', 'otro') DEFAULT 'yappy',
  \`link_pago\` VARCHAR(500) NULL,
  \`comentarios_cliente\` TEXT NULL,
  \`notas_internas_admin\` TEXT NULL,
  \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`actualizado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_reservations_fecha\` (\`fecha_viaje\`),
  INDEX \`idx_reservations_estado\` (\`estado\`),
  INDEX \`idx_reservations_codigo\` (\`codigo_reserva\`),
  FOREIGN KEY (\`lead_id\`) REFERENCES \`registered_clients\`(\`id\`) ON DELETE SET NULL,
  FOREIGN KEY (\`paquete_id\`) REFERENCES \`packages\`(\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. OVERRIDES DE CUPOS DIARIOS EN CALENDARIO
CREATE TABLE IF NOT EXISTS \`calendar_capacity_overrides\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`fecha\` DATE NOT NULL UNIQUE,
  \`cupos_totales\` INT NOT NULL DEFAULT 14,
  \`bloqueado\` TINYINT(1) NOT NULL DEFAULT 0,
  \`motivo_bloqueo\` VARCHAR(255) NULL,
  \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`actualizado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_capacity_fecha\` (\`fecha\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. CONFIGURACIÓN SMTP & CORREOS SALIENTES
CREATE TABLE IF NOT EXISTS \`email_config\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`smtp_host\` VARCHAR(150) NOT NULL DEFAULT 'smtp.mailgun.org',
  \`smtp_port\` INT NOT NULL DEFAULT 587,
  \`smtp_user\` VARCHAR(150) NOT NULL,
  \`smtp_pass\` VARCHAR(255) NOT NULL,
  \`from_name\` VARCHAR(100) NOT NULL DEFAULT 'Guna Vibes San Blas',
  \`from_email\` VARCHAR(150) NOT NULL DEFAULT 'reservas@gunavibes.com',
  \`notificar_admin_nueva_reserva\` TINYINT(1) DEFAULT 1,
  \`notificar_cliente_confirmacion\` TINYINT(1) DEFAULT 1,
  \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. BITÁCORA DE AUDITORÍA Y SEGURIDAD
CREATE TABLE IF NOT EXISTS \`audit_logs\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`usuario\` VARCHAR(100) NOT NULL,
  \`accion\` VARCHAR(100) NOT NULL,
  \`detalles\` TEXT NOT NULL,
  \`ip\` VARCHAR(50) DEFAULT '127.0.0.1',
  \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_audit_usuario\` (\`usuario\`),
  INDEX \`idx_audit_fecha\` (\`creado_en\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. INSERCIÓN DE DATOS INICIALES POR DEFECTO
INSERT INTO \`admin_users\` (\`nombre\`, \`correo\`, \`password_hash\`, \`rol\`)
VALUES ('Administrador Guna Vibes', 'admin@gunavibes.com', '$2b$10$w8T0L8j5GUNA.VIBES.SECURITY.HASH', 'superadmin')
ON DUPLICATE KEY UPDATE \`nombre\`=\`nombre\`;

INSERT INTO \`site_config\` (\`id\`, \`nombre_empresa\`, \`cupo_maximo_dia\`, \`telefono_contacto\`, \`correo_contacto\`, \`whatsapp\`, \`direccion\`, \`bg_color\`, \`primary_color\`, \`secondary_color\`, \`accent_color\`, \`text_color\`)
VALUES (1, 'Guna Vibes', 14, '+507 6369-1775', 'info@gunavibes.com', '+507 6369-1775', 'Calle Primera, casa 36, Urb. Nueva Barriada, Tocumen. Panamá', '#F5EFE6', '#0E9AA7', '#E8622C', '#F2B705', '#123C4B')
ON DUPLICATE KEY UPDATE \`nombre_empresa\`=\`nombre_empresa\`;

-- ==========================================================
-- SCRIPT DE BASE DE DATOS GENERADO CON ÉXITO PARA GUNA VIBES
-- ==========================================================
`;

export const SettingsTab: React.FC = () => {
  const {
    theme,
    config,
    personalTypography,
    updateTheme,
    setPersonalTypography,
    resetPersonalTypography,
  } = useTheme();

  // Color state
  const [bgColor, setBgColor] = useState(theme.bgColor || '#F5EFE6');
  const [primaryColor, setPrimaryColor] = useState(theme.primaryColor || '#0E9AA7');
  const [secondaryColor, setSecondaryColor] = useState(theme.secondaryColor || '#E8622C');
  const [accentColor, setAccentColor] = useState(theme.accentColor || '#F2B705');
  const [textColor, setTextColor] = useState(theme.textColor || '#123C4B');

  // Typography state (Frontend)
  const [fontFrontendHeading, setFontFrontendHeading] = useState(theme.fontFamilyFrontendHeading || 'Outfit');
  const [fontFrontendBody, setFontFrontendBody] = useState(theme.fontFamilyFrontendBody || 'Plus Jakarta Sans');
  const [fontSizeFrontendBase, setFontSizeFrontendBase] = useState(theme.fontSizeFrontendBase || '16px');

  // Typography state (Backend system default)
  const [fontBackend, setFontBackend] = useState(theme.fontFamilyBackend || 'Plus Jakarta Sans');
  const [fontSizeBackend, setFontSizeBackend] = useState(theme.fontSizeBackendBase || '14px');

  // Typography state (Personal override for this user)
  const [personalFont, setPersonalFont] = useState(personalTypography.fontFamily || 'Plus Jakarta Sans');
  const [personalSize, setPersonalSize] = useState(personalTypography.fontSize || '14px');
  const [personalOverride, setPersonalOverride] = useState(personalTypography.overrideSystem || false);

  // General settings state
  const [nombreEmpresa, setNombreEmpresa] = useState(config?.nombre_empresa || 'Guna Vibes');
  const [cupoMaximo, setCupoMaximo] = useState(config?.cupo_maximo_dia || 14);
  const [telefono, setTelefono] = useState(config?.telefono_contacto || '+507 6369-1775');
  const [correo, setCorreo] = useState(config?.correo_contacto || 'info@gunavibes.com');
  const [whatsapp, setWhatsapp] = useState(config?.whatsapp || '+507 6369-1775');
  const [direccion, setDireccion] = useState(config?.direccion || 'Calle Primera, casa 36, Urb. Nueva Barriada, Tocumen. Panamá');

  // External links
  const [externalLinks, setExternalLinks] = useState(config?.enlaces_externos_menu || []);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Database Script UI
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeSqlGuideTab, setActiveSqlGuideTab] = useState<'phpmyadmin' | 'workbench' | 'cli'>('phpmyadmin');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (config) {
      setNombreEmpresa(config.nombre_empresa);
      setCupoMaximo(config.cupo_maximo_dia);
      setTelefono(config.telefono_contacto);
      setCorreo(config.correo_contacto);
      setWhatsapp(config.whatsapp);
      setDireccion(config.direccion);
      setExternalLinks(config.enlaces_externos_menu || []);
    }
  }, [config]);

  useEffect(() => {
    if (theme) {
      setBgColor(theme.bgColor);
      setPrimaryColor(theme.primaryColor);
      setSecondaryColor(theme.secondaryColor);
      setAccentColor(theme.accentColor);
      setTextColor(theme.textColor);
      setFontFrontendHeading(theme.fontFamilyFrontendHeading || 'Outfit');
      setFontFrontendBody(theme.fontFamilyFrontendBody || 'Plus Jakarta Sans');
      setFontSizeFrontendBase(theme.fontSizeFrontendBase || '16px');
      setFontBackend(theme.fontFamilyBackend || 'Plus Jakarta Sans');
      setFontSizeBackend(theme.fontSizeBackendBase || '14px');
    }
  }, [theme]);

  useEffect(() => {
    setPersonalFont(personalTypography.fontFamily);
    setPersonalSize(personalTypography.fontSize);
    setPersonalOverride(personalTypography.overrideSystem);
  }, [personalTypography]);

  // Load audit logs
  useEffect(() => {
    const fetchLogs = async () => {
      setLoadingLogs(true);
      try {
        const logs = await api.getAuditLogs();
        setAuditLogs(logs);
      } catch (err) {
        console.error('Error cargando bitácora de auditoría:', err);
      } finally {
        setLoadingLogs(false);
      }
    };
    fetchLogs();
  }, []);

  const handleApplyPreset = (preset: typeof PRESET_THEMES[0]) => {
    setBgColor(preset.bgColor);
    setPrimaryColor(preset.primaryColor);
    setSecondaryColor(preset.secondaryColor);
    setAccentColor(preset.accentColor);
    setTextColor(preset.textColor);
    updateTheme({
      bgColor: preset.bgColor,
      primaryColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor,
      accentColor: preset.accentColor,
      textColor: preset.textColor,
    });
  };

  const handleLiveColorChange = (type: string, value: string) => {
    if (type === 'bg') {
      setBgColor(value);
      updateTheme({ bgColor: value });
    } else if (type === 'primary') {
      setPrimaryColor(value);
      updateTheme({ primaryColor: value });
    } else if (type === 'secondary') {
      setSecondaryColor(value);
      updateTheme({ secondaryColor: value });
    } else if (type === 'accent') {
      setAccentColor(value);
      updateTheme({ accentColor: value });
    } else if (type === 'text') {
      setTextColor(value);
      updateTheme({ textColor: value });
    }
  };

  const handleFrontendHeadingChange = (font: string) => {
    setFontFrontendHeading(font);
    updateTheme({ fontFamilyFrontendHeading: font });
  };

  const handleFrontendBodyChange = (font: string) => {
    setFontFrontendBody(font);
    updateTheme({ fontFamilyFrontendBody: font });
  };

  const handleFrontendSizeChange = (size: string) => {
    setFontSizeFrontendBase(size);
    updateTheme({ fontSizeFrontendBase: size });
  };

  const handleBackendFontChange = (font: string) => {
    setFontBackend(font);
    updateTheme({ fontFamilyBackend: font });
  };

  const handleBackendSizeChange = (size: string) => {
    setFontSizeBackend(size);
    updateTheme({ fontSizeBackendBase: size });
  };

  // Personal Typography handlers
  const handlePersonalOverrideToggle = (checked: boolean) => {
    setPersonalOverride(checked);
    setPersonalTypography({ overrideSystem: checked, fontFamily: personalFont, fontSize: personalSize });
  };

  const handlePersonalFontChange = (font: string) => {
    setPersonalFont(font);
    setPersonalTypography({ fontFamily: font, overrideSystem: true });
    setPersonalOverride(true);
  };

  const handlePersonalSizeChange = (size: string) => {
    setPersonalSize(size);
    setPersonalTypography({ fontSize: size, overrideSystem: true });
    setPersonalOverride(true);
  };

  const handleResetPersonal = () => {
    resetPersonalTypography();
    setPersonalOverride(false);
    setPersonalFont(fontBackend);
    setPersonalSize(fontSizeBackend);
  };

  const handleAddExternalLink = () => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;
    setExternalLinks([...externalLinks, { label: newLinkLabel.trim(), url: newLinkUrl.trim() }]);
    setNewLinkLabel('');
    setNewLinkUrl('');
  };

  const handleRemoveExternalLink = (index: number) => {
    setExternalLinks(externalLinks.filter((_, i) => i !== index));
  };

  const handleCopySqlScript = () => {
    navigator.clipboard.writeText(MYSQL_SCHEMA_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleDownloadSqlFile = () => {
    const blob = new Blob([MYSQL_SCHEMA_SCRIPT], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'gunavibes_database_schema.sql');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      // 1. Update theme in backend
      await updateTheme({
        bgColor,
        primaryColor,
        secondaryColor,
        accentColor,
        textColor,
        fontFamilyFrontendHeading: fontFrontendHeading,
        fontFamilyFrontendBody: fontFrontendBody,
        fontSizeFrontendBase: fontSizeFrontendBase,
        fontFamilyBackend: fontBackend,
        fontSizeBackendBase: fontSizeBackend,
      });

      // 2. Update general config in backend
      await api.updateAdminConfig({
        nombre_empresa: nombreEmpresa,
        cupo_maximo_dia: Number(cupoMaximo),
        telefono_contacto: telefono,
        correo_contacto: correo,
        whatsapp,
        direccion,
        enlaces_externos_menu: externalLinks,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);

      // Refresh logs
      const logs = await api.getAuditLogs();
      setAuditLogs(logs);
    } catch (err: any) {
      alert(err.message || 'Error guardando ajustes en el backend');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* SUCCESS BANNER */}
      {saveSuccess && (
        <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-bold flex items-center gap-3 shadow-md animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>
            ¡Configuración, colores y tipografías guardados con éxito! Los cambios se sincronizaron con el servidor y se aplican globalmente.
          </span>
        </div>
      )}

      {/* 1. TYPOGRAPHY SELECTOR (FRONTEND + BACKEND + PERSONAL OVERRIDE) */}
      <div
        id="backend-typography-editor-card"
        className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-teal-800 bg-teal-100 mb-1.5">
              <Type className="w-3.5 h-3.5 text-teal-600" />
              <span>Control Tipográfico & Accesibilidad</span>
            </div>
            <h3 className="text-xl font-bold font-heading text-stone-900">
              Gestor de Tipografías & Tamaños (Frontend + Backend + Personal)
            </h3>
            <p className="text-xs text-stone-500 mt-0.5 max-w-2xl">
              Configura la fuente y tamaño para la web pública, para el backend del sistema, y permite a cada usuario personalizar a título personal su tamaño de letra preferido.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500">Modo:</span>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${personalOverride ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-stone-100 text-stone-700'}`}>
              {personalOverride ? 'Override Personal Activo' : 'Tipografía Sistema'}
            </span>
          </div>
        </div>

        {/* 3-Column Typography Architecture Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUMN A: FRONTEND TYPOGRAPHY (PÚBLICO) */}
          <div className="p-5 rounded-2xl bg-stone-50/80 border border-stone-200 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
              <Monitor className="w-4 h-4 text-teal-600" />
              <h4 className="text-xs font-extrabold uppercase text-stone-800 tracking-wider">
                1. Web Pública (Frontend)
              </h4>
            </div>

            {/* Heading Font */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Fuente para Títulos (Headings):
              </label>
              <select
                value={fontFrontendHeading}
                onChange={(e) => handleFrontendHeadingChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {FONT_OPTIONS_HEADINGS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Body Font */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Fuente para Textos de Párrafo (Body):
              </label>
              <select
                value={fontFrontendBody}
                onChange={(e) => handleFrontendBodyChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {FONT_OPTIONS_BODY.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Base Size */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Tamaño de Letra Base (Escala Web):
              </label>
              <select
                value={fontSizeFrontendBase}
                onChange={(e) => handleFrontendSizeChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {FRONTEND_FONT_SIZES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Visual Sample */}
            <div className="p-3 rounded-xl bg-white border border-stone-200 mt-2 space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Muestra Frontend:</span>
              <p
                className="font-bold text-stone-900"
                style={{ fontFamily: `'${fontFrontendHeading}', sans-serif` }}
              >
                Guna Yala San Blas Paradise
              </p>
              <p
                className="text-stone-600 leading-relaxed"
                style={{ fontFamily: `'${fontFrontendBody}', sans-serif`, fontSize: fontSizeFrontendBase }}
              >
                Vive la experiencia más auténtica en las aguas turquesas del Caribe panameño.
              </p>
            </div>
          </div>

          {/* COLUMN B: BACKEND SYSTEM DEFAULT (GLOBAL) */}
          <div className="p-5 rounded-2xl bg-stone-50/80 border border-stone-200 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
              <Server className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-extrabold uppercase text-stone-800 tracking-wider">
                2. Backend Global (Por Defecto)
              </h4>
            </div>

            {/* Backend Font */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Fuente Global del Panel Admin:
              </label>
              <select
                value={fontBackend}
                onChange={(e) => handleBackendFontChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {FONT_OPTIONS_BACKEND.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Backend Base Size */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Tamaño Global del Backend:
              </label>
              <select
                value={fontSizeBackend}
                onChange={(e) => handleBackendSizeChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {BACKEND_FONT_SIZES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Info note */}
            <p className="text-[11px] text-stone-500 leading-relaxed pt-1">
              Esta tipografía se aplica de forma predeterminada a todos los administradores que no hayan configurado una preferencia personal individual.
            </p>

            {/* Visual Sample */}
            <div className="p-3 rounded-xl bg-white border border-stone-200 mt-2 space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Muestra Backend Sistema:</span>
              <p
                className="font-bold text-indigo-950"
                style={{ fontFamily: `'${fontBackend}', sans-serif`, fontSize: fontSizeBackend }}
              >
                Directorio de Clientes & 14 Cupos Disponibles
              </p>
              <p
                className="text-stone-500"
                style={{ fontFamily: `'${fontBackend}', sans-serif`, fontSize: fontSizeBackend }}
              >
                Tablas de control, bitácora y métricas comerciales del embudo.
              </p>
            </div>
          </div>

          {/* COLUMN C: USER PERSONAL OVERRIDE (TITULO PERSONAL) */}
          <div className={`p-5 rounded-2xl border transition-all space-y-4 ${
            personalOverride
              ? 'bg-amber-50/70 border-amber-300 shadow-sm ring-2 ring-amber-300/40'
              : 'bg-stone-50/80 border-stone-200'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-extrabold uppercase text-stone-800 tracking-wider">
                  3. Elección Personal del Usuario
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-900">
                Mi Usuario
              </span>
            </div>

            {/* Toggle switch for personal override */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200">
              <div>
                <span className="text-xs font-bold text-stone-900 block">Personalizar para mi sesión</span>
                <span className="text-[10px] text-stone-400">Guarda en tu navegador local</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={personalOverride}
                  onChange={(e) => handlePersonalOverrideToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {/* Personal Font Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Mi Fuente Preferida:
              </label>
              <select
                disabled={!personalOverride}
                value={personalFont}
                onChange={(e) => handlePersonalFontChange(e.target.value)}
                className={`w-full px-3 py-2 bg-white border rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  !personalOverride ? 'opacity-50 cursor-not-allowed border-stone-200' : 'border-amber-300'
                }`}
              >
                {FONT_OPTIONS_BACKEND.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Personal Size Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Mi Tamaño de Letra Personal:
              </label>
              <select
                disabled={!personalOverride}
                value={personalSize}
                onChange={(e) => handlePersonalSizeChange(e.target.value)}
                className={`w-full px-3 py-2 bg-white border rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  !personalOverride ? 'opacity-50 cursor-not-allowed border-stone-200' : 'border-amber-300'
                }`}
              >
                {BACKEND_FONT_SIZES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            {personalOverride && (
              <button
                type="button"
                onClick={handleResetPersonal}
                className="w-full py-2 px-3 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer a Tipografía del Sistema</span>
              </button>
            )}

            {/* Visual Sample */}
            <div className="p-3 rounded-xl bg-white border border-stone-200 mt-2 space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Mi Vista Actual:</span>
              <p
                className="font-bold text-amber-950"
                style={{
                  fontFamily: personalOverride ? `'${personalFont}', sans-serif` : `'${fontBackend}', sans-serif`,
                  fontSize: personalOverride ? personalSize : fontSizeBackend,
                }}
              >
                {personalOverride ? 'Tipografía Personal Aplicada ✓' : 'Usando Tipografía Global'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MYSQL DATABASE CREATION SECTION (COPIAR SCRIPT SQL) */}
      <div
        id="mysql-database-generator-card"
        className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-blue-800 bg-blue-100 mb-1.5">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Instalación & Base de Datos Relacional</span>
            </div>
            <h3 className="text-xl font-bold font-heading text-stone-900">
              Generador del Script MySQL para Crear la Base de Datos
            </h3>
            <p className="text-xs text-stone-500 mt-0.5 max-w-2xl">
              Copia este script completo y pégalo directamente en phpMyAdmin, MySQL Workbench o tu terminal para crear automáticamente la base de datos con todas sus tablas, claves e índices.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySqlScript}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                copiedSql
                  ? 'bg-emerald-600 text-white scale-105'
                  : 'bg-[#123C4B] hover:bg-[#0E2E3A] text-white hover:scale-102 active:scale-98'
              }`}
            >
              {copiedSql ? <CheckCircle2 className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSql ? '¡Script Copiado al Portapapeles!' : 'Copiar Script MySQL'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadSqlFile}
              className="p-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
              title="Descargar archivo .sql"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Instructions Tabs */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-2 text-xs font-bold">
            <span className="text-stone-500">Instrucciones de Importación:</span>
            <button
              type="button"
              onClick={() => setActiveSqlGuideTab('phpmyadmin')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                activeSqlGuideTab === 'phpmyadmin'
                  ? 'bg-blue-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              phpMyAdmin (cPanel / Hosting)
            </button>
            <button
              type="button"
              onClick={() => setActiveSqlGuideTab('workbench')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                activeSqlGuideTab === 'workbench'
                  ? 'bg-blue-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              MySQL Workbench
            </button>
            <button
              type="button"
              onClick={() => setActiveSqlGuideTab('cli')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                activeSqlGuideTab === 'cli'
                  ? 'bg-blue-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Consola / Docker / CLI
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs text-blue-950 space-y-1 leading-relaxed">
            {activeSqlGuideTab === 'phpmyadmin' && (
              <div>
                <strong>Paso 1:</strong> Abre phpMyAdmin en tu hosting o servidor local.
                <br />
                <strong>Paso 2:</strong> Haz clic en la pestaña superior <strong>"SQL"</strong>.
                <br />
                <strong>Paso 3:</strong> Pega el código SQL copiado abajo en el cuadro de texto.
                <br />
                <strong>Paso 4:</strong> Haz clic en el botón <strong>"Continuar"</strong> o "Ejecutar". Se creará la base de datos <code className="font-mono bg-blue-200/70 px-1 py-0.5 rounded">gunavibes_db</code> con sus 11 tablas e índices.
              </div>
            )}
            {activeSqlGuideTab === 'workbench' && (
              <div>
                <strong>Paso 1:</strong> Abre MySQL Workbench y conéctate a tu instancia de base de datos.
                <br />
                <strong>Paso 2:</strong> Abre una nueva pestaña de consulta (<em>File &gt; New Query Tab</em>).
                <br />
                <strong>Paso 3:</strong> Pega el código SQL copiado y presiona el ícono del <strong>Rayo ⚡ (Execute)</strong>.
              </div>
            )}
            {activeSqlGuideTab === 'cli' && (
              <div>
                Ejecuta el siguiente comando en tu terminal Linux/Mac/Windows o contenedor Docker:
                <pre className="mt-1 p-2 rounded-lg bg-stone-900 text-teal-300 font-mono text-[11px] overflow-x-auto">
                  mysql -u root -p &lt; gunavibes_database_schema.sql
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Script Code Viewer */}
        <div className="relative rounded-2xl bg-stone-900 text-stone-100 border border-stone-800 overflow-hidden shadow-inner font-mono text-xs">
          <div className="flex items-center justify-between px-4 py-2.5 bg-stone-950/80 border-b border-stone-800">
            <div className="flex items-center gap-2 text-stone-400 text-[11px]">
              <Code2 className="w-3.5 h-3.5 text-teal-400" />
              <span>gunavibes_database_schema.sql • 11 Tablas Relacionales (InnoDB, utf8mb4)</span>
            </div>
            <button
              type="button"
              onClick={handleCopySqlScript}
              className="text-[11px] text-teal-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedSql ? 'Copiado' : 'Copiar Código'}</span>
            </button>
          </div>

          <pre className="p-4 overflow-x-auto max-h-72 scrollbar-thin text-[11px] text-stone-300 leading-relaxed">
            <code>{MYSQL_SCHEMA_SCRIPT}</code>
          </pre>
        </div>
      </div>

      {/* 3. COLOR PALETTE EDITOR (FONDO CREMA & MARCA) */}
      <div
        id="backend-theme-editor-card"
        className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-900 bg-amber-100/80 mb-1">
              <Palette className="w-3.5 h-3.5 text-amber-700" />
              <span>Personalización Visual Centralizada</span>
            </div>
            <h3 className="text-xl font-bold font-heading text-stone-900">
              Color del Fondo y Paleta Visual (Control desde el Backend)
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Fondo color crema (#F5EFE6) modificable en tiempo real desde el backend.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-medium">Previsualización:</span>
            <div
              className="w-8 h-8 rounded-full border-2 border-stone-400 shadow-inner"
              style={{ backgroundColor: bgColor }}
              title={`Fondo: ${bgColor}`}
            />
          </div>
        </div>

        {/* Quick Palette Presets */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
            Paletas Rápidas Predefinidas
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PRESET_THEMES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="p-3 rounded-2xl border border-stone-200 hover:border-teal-500 hover:shadow-md transition-all text-left space-y-2 bg-stone-50/50 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900">{preset.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full border border-stone-300 shadow-sm" style={{ backgroundColor: preset.bgColor }} title="Fondo" />
                  <div className="w-5 h-5 rounded-full border border-stone-300 shadow-sm" style={{ backgroundColor: preset.primaryColor }} title="Primario" />
                  <div className="w-5 h-5 rounded-full border border-stone-300 shadow-sm" style={{ backgroundColor: preset.secondaryColor }} title="Secundario" />
                  <div className="w-5 h-5 rounded-full border border-stone-300 shadow-sm" style={{ backgroundColor: preset.accentColor }} title="Acento" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Individual Color Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
          
          {/* Background Color (Crema) */}
          <div className="p-4 rounded-2xl bg-amber-50/40 border-2 border-amber-200 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-900">
              Color de Fondo (Web) *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => handleLiveColorChange('bg', e.target.value)}
                className="w-10 h-10 rounded-xl border border-stone-300 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => handleLiveColorChange('bg', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-mono font-bold uppercase"
              />
            </div>
            <p className="text-[10px] text-amber-800 font-medium">Default: #F5EFE6 (Crema)</p>
          </div>

          {/* Primary Color (Turquoise) */}
          <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-200 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-teal-900">
              Color Primario (Turquesa)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => handleLiveColorChange('primary', e.target.value)}
                className="w-10 h-10 rounded-xl border border-stone-300 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => handleLiveColorChange('primary', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-mono font-bold uppercase"
              />
            </div>
            <p className="text-[10px] text-teal-700">Navbar, Iconos, Botones</p>
          </div>

          {/* Secondary Color (Coral) */}
          <div className="p-4 rounded-2xl bg-orange-50/40 border border-orange-200 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-orange-900">
              Color Secundario (Coral)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => handleLiveColorChange('secondary', e.target.value)}
                className="w-10 h-10 rounded-xl border border-stone-300 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={secondaryColor}
                onChange={(e) => handleLiveColorChange('secondary', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-mono font-bold uppercase"
              />
            </div>
            <p className="text-[10px] text-orange-700">Botón de Reserva, CTAs</p>
          </div>

          {/* Accent Color (Yellow) */}
          <div className="p-4 rounded-2xl bg-yellow-50/40 border border-yellow-200 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-yellow-900">
              Color de Acento (Amarillo)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => handleLiveColorChange('accent', e.target.value)}
                className="w-10 h-10 rounded-xl border border-stone-300 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) => handleLiveColorChange('accent', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-mono font-bold uppercase"
              />
            </div>
            <p className="text-[10px] text-yellow-700">Estrellas, Badges</p>
          </div>

          {/* Text Color (Navy) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
              Color Texto Principal
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={textColor}
                onChange={(e) => handleLiveColorChange('text', e.target.value)}
                className="w-10 h-10 rounded-xl border border-stone-300 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => handleLiveColorChange('text', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-mono font-bold uppercase"
              />
            </div>
            <p className="text-[10px] text-slate-600">Footer, Encabezados</p>
          </div>
        </div>
      </div>

      {/* 4. GENERAL SETTINGS & CAPACITY LIMIT */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
        <h3 className="text-xl font-bold font-heading text-stone-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#0E9AA7]" />
          <span>Información de la Empresa y Cupos Diarios</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Company Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Nombre de la Empresa
            </label>
            <input
              type="text"
              value={nombreEmpresa}
              onChange={(e) => setNombreEmpresa(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#0E9AA7]"
            />
          </div>

          {/* Daily Quota Limit */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#0E9AA7]" />
              <span>Límite de Cupos Diarios (Default: 14) *</span>
            </label>
            <input
              type="number"
              min={1}
              max={100}
              required
              value={cupoMaximo}
              onChange={(e) => setCupoMaximo(parseInt(e.target.value, 10) || 14)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 focus:ring-2 focus:ring-[#0E9AA7]"
            />
            <p className="text-[11px] text-stone-400 mt-1">El motor de reservas bloqueará solicitudes que excedan este número por fecha.</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Teléfono de Contacto
            </label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#0E9AA7]"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Correo Electrónico de Contacto
            </label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#0E9AA7]"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Número de WhatsApp
            </label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#0E9AA7]"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Dirección Física
            </label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#0E9AA7]"
            />
          </div>
        </div>
      </div>

      {/* 5. EXTERNAL MENU LINKS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-5">
        <h3 className="text-lg font-bold font-heading text-stone-900 flex items-center gap-2">
          <Link className="w-5 h-5 text-[#0E9AA7]" />
          <span>Enlaces Externos Personalizados en el Menú Superior</span>
        </h3>
        <p className="text-xs text-stone-500">
          Permite agregar accesos directos a carpetas internas, sistemas de gestión o páginas de interés.
        </p>

        {/* Links list */}
        <div className="space-y-2">
          {externalLinks.map((link, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
              <div>
                <strong className="text-stone-900 font-semibold">{link.label}</strong>
                <span className="text-stone-400 font-mono ml-2 truncate max-w-xs">{link.url}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveExternalLink(idx)}
                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add link form */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <input
            type="text"
            placeholder="Título (Ej. Recursos Internos)"
            value={newLinkLabel}
            onChange={(e) => setNewLinkLabel(e.target.value)}
            className="w-full sm:w-1/3 px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
          />
          <input
            type="url"
            placeholder="URL (https://...)"
            value={newLinkUrl}
            onChange={(e) => setNewLinkUrl(e.target.value)}
            className="w-full sm:w-1/2 px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-mono"
          />
          <button
            type="button"
            onClick={handleAddExternalLink}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar</span>
          </button>
        </div>
      </div>

      {/* SAVE ALL BUTTON */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="px-8 py-4 rounded-2xl font-bold text-white shadow-xl flex items-center gap-2.5 text-sm cursor-pointer hover:scale-102 active:scale-98 transition-all"
          style={{ backgroundColor: secondaryColor }}
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>Guardar Todos los Ajustes, Tipografía y Colores en Backend</span>
        </button>
      </div>

      {/* 6. AUDIT LOGS (BITÁCORA DE ACCIONES) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
            <History className="w-4 h-4 text-[#0E9AA7]" />
            <span>Bitácora de Auditoría del Sistema ({auditLogs.length})</span>
          </h4>
          <span className="text-[11px] text-stone-400">Registra inicios de sesión, cambios de estado y envíos</span>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto divide-y divide-stone-100 text-xs">
          {loadingLogs ? (
            <p className="text-stone-400 italic py-4">Cargando registros...</p>
          ) : auditLogs.length === 0 ? (
            <p className="text-stone-400 italic py-4">No hay registros de auditoría aún.</p>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="pt-2 flex items-center justify-between text-stone-600">
                <div className="space-x-2">
                  <span className="font-bold text-stone-900 font-mono text-[11px] bg-stone-100 px-1.5 py-0.5 rounded">
                    {log.accion}
                  </span>
                  <span>{log.detalles}</span>
                </div>
                <div className="text-[11px] text-stone-400">
                  {new Date(log.creado_en).toLocaleString()} • {log.ip}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
