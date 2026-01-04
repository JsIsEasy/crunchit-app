import { Button } from "../ui/button";

type Props = {
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
};

export default function Base({ children, onClick }: Props) {
  return (
    <Button className="cursor-pointer" variant={"outline"} onClick={onClick}>
      {children}
    </Button>
  );
}
