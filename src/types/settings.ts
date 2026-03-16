export type SmtpSettings = {
  host: string;
  port: number;
  username: string;
  fromEmail: string;
  fromName: string;
  enableSsl: boolean;
  hasPassword: boolean;
};

export type UpdateSmtpSettingsRequest = {
  host: string;
  port: number;
  username: string;
  password?: string;
  fromEmail: string;
  fromName: string;
  enableSsl: boolean;
};
