
-- Function to handle vote counts automatically
-- IMPORTANT: 'SECURITY DEFINER' allows this function to bypass RLS policies
-- This is necessary because users are not allowed to update 'confessions' table directly
CREATE OR REPLACE FUNCTION public.handle_vote()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle Insert
  IF (TG_OP = 'INSERT') THEN
    IF (NEW.vote_type = 1) THEN
      UPDATE public.confessions SET upvotes = upvotes + 1 WHERE id = NEW.confession_id;
    ELSE
      UPDATE public.confessions SET downvotes = downvotes + 1 WHERE id = NEW.confession_id;
    END IF;
  
  -- Handle Delete
  ELSIF (TG_OP = 'DELETE') THEN
    IF (OLD.vote_type = 1) THEN
      UPDATE public.confessions SET upvotes = upvotes - 1 WHERE id = OLD.confession_id;
    ELSE
      UPDATE public.confessions SET downvotes = downvotes - 1 WHERE id = OLD.confession_id;
    END IF;

  -- Handle Update
  ELSIF (TG_OP = 'UPDATE') THEN
    -- If vote_type changed
    IF (OLD.vote_type IS DISTINCT FROM NEW.vote_type) THEN
      -- Revert OLD
      IF (OLD.vote_type = 1) THEN
        UPDATE public.confessions SET upvotes = upvotes - 1 WHERE id = OLD.confession_id;
      ELSE
        UPDATE public.confessions SET downvotes = downvotes - 1 WHERE id = OLD.confession_id;
      END IF;
      
      -- Apply NEW
      IF (NEW.vote_type = 1) THEN
        UPDATE public.confessions SET upvotes = upvotes + 1 WHERE id = NEW.confession_id;
      ELSE
        UPDATE public.confessions SET downvotes = downvotes + 1 WHERE id = NEW.confession_id;
      END IF;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists to avoid conflicts
DROP TRIGGER IF EXISTS on_vote_change ON public.votes;

-- Create the trigger
CREATE TRIGGER on_vote_change
AFTER INSERT OR UPDATE OR DELETE ON public.votes
FOR EACH ROW EXECUTE FUNCTION public.handle_vote();
