
-- 1. Reset the Trigger Function with robust logic
CREATE OR REPLACE FUNCTION public.handle_vote()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Handle Insert
  IF (TG_OP = 'INSERT') THEN
    IF (NEW.vote_type = 1) THEN
      UPDATE public.confessions 
      SET upvotes = COALESCE(upvotes, 0) + 1 
      WHERE id = NEW.confession_id;
    ELSE
      UPDATE public.confessions 
      SET downvotes = COALESCE(downvotes, 0) + 1 
      WHERE id = NEW.confession_id;
    END IF;
  
  -- Handle Delete
  ELSIF (TG_OP = 'DELETE') THEN
    IF (OLD.vote_type = 1) THEN
      UPDATE public.confessions 
      SET upvotes = GREATEST(COALESCE(upvotes, 0) - 1, 0) 
      WHERE id = OLD.confession_id;
    ELSE
      UPDATE public.confessions 
      SET downvotes = GREATEST(COALESCE(downvotes, 0) - 1, 0) 
      WHERE id = OLD.confession_id;
    END IF;

  -- Handle Update
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (OLD.vote_type IS DISTINCT FROM NEW.vote_type) THEN
      -- Create space for the swap to avoid negative transient states (optional, but safely handled by GREATEST via separate updates)
      
      -- Remove OLD
      IF (OLD.vote_type = 1) THEN
        UPDATE public.confessions 
        SET upvotes = GREATEST(COALESCE(upvotes, 0) - 1, 0) 
        WHERE id = OLD.confession_id;
      ELSE
        UPDATE public.confessions 
        SET downvotes = GREATEST(COALESCE(downvotes, 0) - 1, 0) 
        WHERE id = OLD.confession_id;
      END IF;
      
      -- Add NEW
      IF (NEW.vote_type = 1) THEN
        UPDATE public.confessions 
        SET upvotes = COALESCE(upvotes, 0) + 1 
        WHERE id = NEW.confession_id;
      ELSE
        UPDATE public.confessions 
        SET downvotes = COALESCE(downvotes, 0) + 1 
        WHERE id = NEW.confession_id;
      END IF;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

-- 2. Re-create the Trigger
DROP TRIGGER IF EXISTS on_vote_change ON public.votes;

CREATE TRIGGER on_vote_change
AFTER INSERT OR UPDATE OR DELETE ON public.votes
FOR EACH ROW EXECUTE FUNCTION public.handle_vote();

-- 3. ONE-TIME SYNC: Fix existing broken counts
-- This calculates the correct count from the votes table and applies it to confessions
WITH vote_counts AS (
    SELECT 
        confession_id,
        COUNT(*) FILTER (WHERE vote_type = 1) as true_upvotes,
        COUNT(*) FILTER (WHERE vote_type = -1) as true_downvotes
    FROM public.votes
    GROUP BY confession_id
)
UPDATE public.confessions c
SET 
    upvotes = vc.true_upvotes,
    downvotes = vc.true_downvotes
FROM vote_counts vc
WHERE c.id = vc.confession_id;
