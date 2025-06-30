import config from "../../../config";

export const failureRedirectUrl = `${config.backend_url}/login?auth=failed`
export const successRedirectUrl = `${config.backend_url}?auth=success`
