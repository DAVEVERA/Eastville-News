export const config = {
  theme: {
    primaryColor: '#007AFF', // iOS Blue for better contrast on glass
    secondaryColor: '#1c1c1e',
    backgroundColor: '#000000',
    textColor: '#ffffff',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    accentColor: '#FF9500',
  },
  animation: {
    sliderDuration: 12000,
    scrollSpeed: 120, // Higher number = slower duration if it's used as animation-duration
  },
  layout: {
    gridGap: '20px',
    sidebarWidth: '350px',
  },
  widgets: {
    weatherLocation: 'Uden',
    apiKeys: {
      // Future: Add API keys if needed
    }
  },
  videoBackground: {
    enabled: true,
    url: "https://www.youtube.com/embed/Hgg7M3kSqyE?autoplay=1&mute=1&loop=1&playlist=Hgg7M3kSqyE&controls=0&modestbranding=1&rel=0"
  }
};
