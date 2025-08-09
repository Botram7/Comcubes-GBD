import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Building2, Factory, Building, ChevronRight, Play, Pause } from "lucide-react";

interface ExplainerStep {
  id: number;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  example: string;
}

const explainerSteps: ExplainerStep[] = [
  {
    id: 1,
    title: "Start with Business Sectors",
    description: "Browse broad business categories like Banking, Technology, Healthcare, and more.",
    icon: Building2,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    example: "Banking & Financial Services"
  },
  {
    id: 2,
    title: "Explore Industries",
    description: "Dive into specific industries within each sector to find specialized markets.",
    icon: Factory,
    color: "text-green-600",
    bgColor: "bg-green-50",
    example: "Consumer Finance"
  },
  {
    id: 3,
    title: "Discover Companies",
    description: "Find detailed company profiles with comprehensive business information.",
    icon: Building,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    example: "American Express"
  }
];

const getBorderClass = (colorClass: string) => {
  if (colorClass.includes('blue')) return 'border-blue-500';
  if (colorClass.includes('green')) return 'border-green-500';
  if (colorClass.includes('purple')) return 'border-purple-500';
  return 'border-gray-500';
};

const getBorderColorClass = (colorClass: string) => {
  if (colorClass.includes('blue')) return 'border-blue-200';
  if (colorClass.includes('green')) return 'border-green-200';
  if (colorClass.includes('purple')) return 'border-purple-200';
  return 'border-gray-200';
};

export function AnimatedExplainer() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showExample, setShowExample] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const nextStep = (prev + 1) % explainerSteps.length;
        if (nextStep === 0) {
          // Reset example animation when cycling back to start
          setShowExample(false);
          setTimeout(() => setShowExample(true), 500);
        }
        return nextStep;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    // Trigger example animation when step changes
    setShowExample(false);
    const timer = setTimeout(() => setShowExample(true), 500);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying);
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setIsPlaying(false);
  };

  const navigateToPage = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        setLocation('/sectors');
        break;
      case 1:
        setLocation('/industries');
        break;
      case 2:
        setLocation('/companies');
        break;
      default:
        setLocation('/sectors');
    }
  };

  const navigateToSpecificExample = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        setLocation('/sector/Banking and Financial Services');
        break;
      case 1:
        setLocation('/industry/Consumer Finance');
        break;
      case 2:
        setLocation('/company/151'); // American Express ID
        break;
      default:
        setLocation('/sectors');
    }
  };

  const currentStepData = explainerSteps[currentStep];

  return (
    <div className="relative">
      {/* Header */}
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
          How to Navigate COMCUBES
        </h2>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
          Discover businesses through our structured approach: start broad with sectors, 
          narrow down to industries, then explore individual companies.
        </p>
      </div>

      {/* Animation Controls */}
      <div className="flex justify-center mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleAnimation}
          className="flex items-center gap-2"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isPlaying ? "Pause" : "Play"}
        </Button>
      </div>

      {/* Navigation Flow Visualization */}
      <div className="relative max-w-4xl mx-auto">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 transform -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-blue-500 transform -translate-y-1/2 z-0 transition-all duration-1000 ease-out"
          style={{ width: `${((currentStep + 1) / explainerSteps.length) * 100}%` }}
        />

        {/* Steps */}
        <div className="relative flex justify-between items-center z-10">
          {explainerSteps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const IconComponent = step.icon;

            return (
              <div key={step.id} className="flex flex-col items-center">
                {/* Step Circle */}
                <div
                  className={`
                    relative w-16 h-16 md:w-20 md:h-20 rounded-full border-3 md:border-4 cursor-pointer transition-all duration-500 transform
                    ${isActive 
                      ? `${step.bgColor} ${getBorderClass(step.color)} scale-110 shadow-lg` 
                      : isCompleted 
                        ? 'bg-blue-50 border-blue-500' 
                        : 'bg-white border-gray-300 hover:border-gray-400'
                    }
                  `}
                  onClick={() => navigateToPage(index)}
                  title={`Navigate to ${step.title}`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <IconComponent 
                      className={`h-6 w-6 md:h-8 md:w-8 transition-colors duration-300 ${
                        isActive ? step.color : isCompleted ? 'text-blue-600' : 'text-gray-400'
                      }`} 
                    />
                  </div>
                  
                  {/* Pulse animation for active step */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full animate-pulse bg-blue-200 opacity-50" />
                  )}
                </div>

                {/* Step Number */}
                <div className={`
                  mt-2 w-6 h-6 rounded-full text-sm font-bold flex items-center justify-center transition-colors duration-300
                  ${isActive || isCompleted ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  {step.id}
                </div>

                {/* Arrow */}
                {index < explainerSteps.length - 1 && (
                  <ChevronRight 
                    className={`
                      absolute top-10 left-1/2 transform translate-x-8 h-6 w-6 transition-colors duration-300
                      ${index < currentStep ? 'text-blue-500' : 'text-gray-300'}
                    `} 
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Details */}
      <div className="mt-12 max-w-2xl mx-auto">
        <Card className="border-2 border-gray-100 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${currentStepData.bgColor} mb-4`}>
                <currentStepData.icon className={`h-8 w-8 ${currentStepData.color}`} />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {currentStepData.title}
              </h3>
              
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                {currentStepData.description}
              </p>

              {/* Example Animation */}
              <div className="relative">
                <div 
                  className={`
                    inline-flex items-center gap-3 px-6 py-3 rounded-lg border-2 transition-all duration-500 transform cursor-pointer hover:shadow-md
                    ${showExample ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
                    ${currentStepData.bgColor} ${getBorderColorClass(currentStepData.color)}
                  `}
                  onClick={() => navigateToSpecificExample(currentStep)}
                  title={`View ${currentStepData.example}`}
                >
                  <currentStepData.icon className={`h-5 w-5 ${currentStepData.color}`} />
                  <span className="font-semibold text-gray-800">
                    Example: {currentStepData.example}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-500 ml-2" />
                </div>

                {/* Highlight effect */}
                {showExample && (
                  <div className="absolute inset-0 rounded-lg bg-yellow-200 opacity-30 animate-ping" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Hints */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {explainerSteps.map((step, index) => (
          <Card 
            key={step.id} 
            className={`
              cursor-pointer transition-all duration-300 hover:shadow-md
              ${index === currentStep ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-lg'}
            `}
            onClick={() => navigateToPage(index)}
            title={`Navigate to ${step.title}`}
          >
            <CardContent className="p-4 text-center">
              <step.icon className={`h-6 w-6 mx-auto mb-2 ${step.color}`} />
              <h4 className="font-semibold text-sm text-gray-800">{step.title}</h4>
              <p className="text-xs text-gray-600 mt-1">{step.example}</p>
              <ArrowRight className="h-3 w-3 mx-auto mt-2 text-gray-400" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}