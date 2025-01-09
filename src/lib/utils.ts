import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

//bug in current shadcn version. 
//if you want components run: shadcn-ui@0.8.0 add <component name>