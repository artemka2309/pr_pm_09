export interface SlideImage {
  path: string;
}

export interface Slide {
  title: string;
  desc: string;
  button: string; // URL
  button_text: string;
  images: SlideImage[];
}

export interface SlidersApiResponse {
  sliders: Slide[];
} 