export const textVariant = (delay: number) => {
  return {
    hidden: {
      y: -30,
      opacity: 0,
    },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        duration: 0.6,
        delay: delay,
        stiffness: 100,
        damping: 20,
      },
    },
  };
};

export const fadeIn = (direction: string, type: string, delay: number, duration: number) => {
  return {
    hidden: {
      x: direction === "left" ? 50 : direction === "right" ? -50 : 0,
      y: direction === "up" ? 50 : direction === "down" ? -50 : 0,
      opacity: 0,
    },
    show: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type: type as any,
        delay: delay,
        duration: Math.min(duration, 0.5),
        ease: "easeOut" as const,
      },
    },
  };
};

export const zoomIn = (delay: number, duration: number) => {
  return {
    hidden: {
      scale: 0,
      opacity: 0,
    },
    show: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "tween" as const,
        delay: delay,
        duration: duration,
        ease: "easeOut" as const,
      },
    },
  };
};

export const slideIn = (direction: string, type: string, delay: number, duration: number) => {
  return {
    hidden: {
      x: direction === "left" ? "-100%" : direction === "right" ? "100%" : 0,
      y: direction === "up" ? "100%" : direction === "down" ? "100%" : 0,
    },
    show: {
      x: 0,
      y: 0,
      transition: {
        type: type as any,
        delay: delay,
        duration: duration,
        ease: "easeOut" as const,
      },
    },
  };
};

export const staggerContainer = (staggerChildren: number, delayChildren: number = 0) => {
  return {
    hidden: {},
    show: {
      transition: {
        staggerChildren: Math.min(staggerChildren, 0.1),
        delayChildren: Math.min(delayChildren, 0.1),
      },
    },
  };
};

// Additional tilt animation for cards
export const tiltVariant = {
  hidden: {
    rotateX: 0,
    rotateY: 0,
    scale: 1,
  },
  show: {
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    },
  },
  hover: {
    rotateX: 5,
    rotateY: 5,
    scale: 1.02,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 10,
    },
  },
};

// Card animation variants
export const cardVariant = {
  hidden: {
    y: 30,
    opacity: 0,
  },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 25,
      duration: 0.4,
    },
  },
  hover: {
    y: -3,
    scale: 1.01,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 15,
      duration: 0.2,
    },
  },
};
