// The provider requires the same message body on every retry of a delivery key.
export const notificationKey = (reference: string) => `enquiry-v2-${reference}`;
