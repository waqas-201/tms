const fs = require('fs');
let code = fs.readFileSync('app/components/hijama/HijamaBookingModal.tsx', 'utf8');

const target = `  const authModal = (
    <AuthModal
      isOpen={isAuthModalOpen}
      onOpenChange={setIsAuthModalOpen}
    />
  );

  if (isInline) {
    return (
      <>
        {content}
        {authModal}
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
        {content}
      </div>
      {authModal}
    </>
  );
}`;

const replacement = `  if (isInline) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {content}
    </div>
  );
}`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('app/components/hijama/HijamaBookingModal.tsx', code, 'utf8');
  console.log('Successfully removed authModal from HijamaBookingModal');
} else {
  console.log('Target not found');
}
