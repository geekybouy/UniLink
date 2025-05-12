
import React from 'react';
import { AlertTriangle, Shield, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CredentialRiskIndicatorProps {
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  riskScore?: number;
  small?: boolean;
  showScore?: boolean;
}

const CredentialRiskIndicator: React.FC<CredentialRiskIndicatorProps> = ({ 
  riskLevel = 'low',
  riskScore,
  small = false,
  showScore = false
}) => {
  // If no risk data, return nothing
  if (!riskLevel) return null;

  const iconSize = small ? 'h-3 w-3' : 'h-4 w-4';
  
  const getRiskDetails = () => {
    switch (riskLevel) {
      case 'critical':
        return {
          icon: <AlertCircle className={`${iconSize} animate-pulse`} />,
          color: 'bg-red-500 text-white',
          label: 'Critical Risk',
          description: 'This credential has been flagged as potentially fraudulent and is under review.'
        };
      case 'high':
        return {
          icon: <AlertTriangle className={iconSize} />,
          color: 'bg-orange-500 text-white',
          label: 'High Risk',
          description: 'This credential has suspicious characteristics that require attention.'
        };
      case 'medium':
        return {
          icon: <AlertTriangle className={iconSize} />,
          color: 'bg-yellow-500 text-black',
          label: 'Medium Risk',
          description: 'This credential has some unusual patterns that might need verification.'
        };
      default: // low
        return {
          icon: <Shield className={iconSize} />,
          color: 'bg-green-500 text-white',
          label: 'Low Risk',
          description: 'This credential has passed our fraud detection checks.'
        };
    }
  };
  
  const { icon, color, label, description } = getRiskDetails();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${color} flex items-center gap-1`}>
            {icon}
            {small ? '' : label}
            {showScore && riskScore !== undefined && ` (${riskScore})`}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs">
            <p className="font-bold text-sm">{label}</p>
            <p className="text-xs">{description}</p>
            {riskScore !== undefined && (
              <p className="text-xs mt-1">Risk score: {riskScore}/100</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CredentialRiskIndicator;
