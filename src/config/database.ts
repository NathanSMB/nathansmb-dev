import { getString } from "../utils/environment-variables";

export const DATABASE_URL = getString("NETLIFY_DATABASE_URL");
