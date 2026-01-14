import { useUserStore } from "@/utils/useUserStore";
import { getProfileImageUrl } from "@/utils/imageUtils";

type SlideContainerProps = {
  title: string;
  containerRef: (el: HTMLDivElement | null) => void;
  children: React.ReactNode;
  id?: string;
  dateRange?: string;
};

export default function SlideContainer({ title, containerRef, children, id, dateRange }: SlideContainerProps) {
  const { user } = useUserStore();

  // Don't render anything if neither name nor logo is present
  const hasCompanyInfo = user?.companyName || user?.companyLogo;

  return (
    <div
      id={id}
      ref={containerRef}
      className="w-full md:w-[95%] lg:w-[90%] h-auto my-4 md:my-6 lg:my-10 shadow pb-6 md:pb-8 lg:pb-10 rounded-xl md:rounded-2xl bg-white relative"
    >
      <div className="p-3 md:p-4 mb-3 md:mb-4">
        <h1 className="text-base md:text-lg font-semibold text-gray-800">
          {title}
        </h1>
        {dateRange && (
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            {dateRange}
          </p>
        )}
      </div>
      {children}

      {/* Company Footer */}
      {hasCompanyInfo && (
        <div className="absolute bottom-4 right-6 flex items-center gap-2 opacity-50 pointer-events-none">
          {user?.companyName && (
            <span className="text-xs text-gray-400 font-medium">
              {user.companyName}
            </span>
          )}
          {user?.companyLogo && (
            <img
              src={getProfileImageUrl(user.companyLogo)}
              alt={user.companyName || "Company Logo"}
              className="h-6 w-6 object-cover rounded-full"
            />
          )}
        </div>
      )}
    </div>
  );
}
