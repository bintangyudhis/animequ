import { BagianBeranda } from "./BagianBeranda";
import HeroBeranda from "./HeroBeranda";
import PintasanJelajah from "./PintasanJelajah";

export default function Beranda() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 py-10 sm:px-6 sm:py-14">
      <HeroBeranda />
      <BagianBeranda />
      <PintasanJelajah />
    </div>
  );
}
